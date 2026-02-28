from PIL import Image, ImageDraw, ImageFont
import os

FONT_PATHS = [
    "C:/Windows/Fonts/malgun.ttf",      # 맑은 고딕 (한글 지원)
    "C:/Windows/Fonts/malgunbd.ttf",
    "C:/Windows/Fonts/arial.ttf",
    "C:/Windows/Fonts/Arial.ttf",
]

def _get_font(size: int):
    for path in FONT_PATHS:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()

def apply_watermark(file_path: str, nickname: str):
    try:
        img = Image.open(file_path).convert("RGBA")
        w, h = img.size

        watermark_text = f"Market | {nickname}"

        font_size = max(36, int(min(w, h) * 0.12))
        font = _get_font(font_size)

        # 투명 레이어 생성
        overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)

        bbox = draw.textbbox((0, 0), watermark_text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]

        # 중앙 배치
        x = (w - text_w) // 2
        y = (h - text_h) // 2

        # 배경 없이 회색 텍스트 (그림자로 가독성 확보)
        draw.text((x + 2, y + 2), watermark_text, font=font, fill=(0, 0, 0, 80))
        draw.text((x, y), watermark_text, font=font, fill=(160, 160, 160, 180))

        watermarked = Image.alpha_composite(img, overlay)

        # 원본 확장자에 맞게 저장
        ext = os.path.splitext(file_path)[1].lower()
        if ext in (".jpg", ".jpeg"):
            watermarked = watermarked.convert("RGB")
            watermarked.save(file_path, "JPEG", quality=95)
        else:
            watermarked.save(file_path, "PNG")

    except Exception as e:
        print(f"[watermark] 워터마크 적용 실패: {e}")