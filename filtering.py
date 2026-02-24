import re
from fastapi import HTTPException
from safe_browsing import check_url_safety  # 별도 구현 필요

# 전화번호 정규식 (휴대폰 + 지역번호)
PHONE_PATTERN = re.compile(r'\b(01[016789]|02|0[3-9][0-9])[- ]?(\d{3,4})[- ]?(\d{4})\b')

# 주민등록번호
RRN_PATTERN = re.compile(r'\b(\d{6})[- ]?([1-4]\d{6})\b')

# 계좌번호 (대략 6~14자리 숫자)
ACCOUNT_PATTERN = re.compile(r'\b\d{2,6}[- ]?\d{2,6}[- ]?\d{2,6}\b')

# 주소 (시/도 + 구까지만 유지)
ADDRESS_PATTERN = re.compile(
    r'\b(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)[^\n,]{5,}\b'
)

# URL 검출
URL_PATTERN = re.compile(r'(https?://[^\s]+)')

def mask_sensitive_info(text: str) -> str:
    if not text:
        return text

    # 1️.URL 안전검사
    urls = URL_PATTERN.findall(text)
    for url in urls:
        if not check_url_safety(url):
            raise HTTPException(status_code=400, detail="위험한 URL이 포함되어 있습니다.")

    # 2️.전화번호 마스킹
    text = PHONE_PATTERN.sub(
        lambda m: f"{m.group(1)}-****-{m.group(3)}",
        text
    )

    # 3️.주민등록번호 마스킹
    text = RRN_PATTERN.sub(
        lambda m: f"{m.group(1)}-*******",
        text
    )

    # 4️.계좌번호 마스킹 (앞 3자리, 뒤 2자리만 노출)
    def mask_account(m):
        number = re.sub(r'\D', '', m.group(0))  # 숫자만 추출
        if len(number) < 6:
            return "*" * len(number)
        return number[:3] + "*" * (len(number) - 5) + number[-2:]
    
    text = ACCOUNT_PATTERN.sub(mask_account, text)

    # 5️.주소 마스킹
    def mask_address(m):
        full = m.group(0)
        parts = full.split()
        if len(parts) >= 2:
            return parts[0] + " " + parts[1] + " ******" 
        return parts[0] + " ******"

    text = ADDRESS_PATTERN.sub(mask_address, text)

    return text