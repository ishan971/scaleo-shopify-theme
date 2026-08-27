from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

BASE = r'd:\Codebase\scaleo-shopify\assets'
CARD_W, CARD_H = 900, 520
PAD_X = 18
PAD_TOP = 14
LABEL_H = 28
GAP_LABEL = 10
GAP_SHOTS = 10
PAD_BOTTOM = 16
RADIUS = 18
ACCENT = (12, 127, 223)
BG = (255, 255, 255)


def round_mask(size, radius):
    mask = Image.new('L', size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, size[0] - 1, size[1] - 1], radius=radius, fill=255)
    return mask


def cover_crop(im, tw, th):
    im = im.convert('RGB')
    sw, sh = im.size
    scale = max(tw / sw, th / sh)
    nw, nh = int(sw * scale + 0.5), int(sh * scale + 0.5)
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return im.crop((left, top, left + tw, top + th))


def load_font(size, bold=False):
    candidates = [
        r'C:\Windows\Fonts\segoeuib.ttf' if bold else r'C:\Windows\Fonts\segoeui.ttf',
        r'C:\Windows\Fonts\arialbd.ttf' if bold else r'C:\Windows\Fonts\arial.ttf',
        r'C:\Windows\Fonts\calibrib.ttf' if bold else r'C:\Windows\Fonts\calibri.ttf',
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def make_card(before_path, after_path, label, out_name):
    card = Image.new('RGB', (CARD_W, CARD_H), BG)
    draw = ImageDraw.Draw(card)

    font_label = load_font(22, bold=True)
    font_tag = load_font(20, bold=True)

    draw.text((PAD_X, PAD_TOP), label, font=font_label, fill=ACCENT)

    shot_top = PAD_TOP + LABEL_H + GAP_LABEL
    shot_h = CARD_H - shot_top - PAD_BOTTOM
    shot_w = (CARD_W - PAD_X * 2 - GAP_SHOTS) // 2

    before = cover_crop(Image.open(before_path), shot_w, shot_h)
    after = cover_crop(Image.open(after_path), shot_w, shot_h)
    mask = round_mask((shot_w, shot_h), RADIUS)

    def paste_shot(img, x, tag):
        shadow = Image.new('RGBA', (shot_w + 8, shot_h + 8), (0, 0, 0, 0))
        sd = ImageDraw.Draw(shadow)
        sd.rounded_rectangle([2, 2, shot_w + 2, shot_h + 2], radius=RADIUS, fill=(20, 40, 70, 35))
        shadow = shadow.filter(ImageFilter.GaussianBlur(3))
        card.paste(shadow, (x - 2, shot_top - 1), shadow)

        rounded = Image.new('RGBA', (shot_w, shot_h))
        rounded.paste(img, (0, 0))
        rounded.putalpha(mask)
        card.paste(rounded, (x, shot_top), rounded)

        tx, ty = x + 12, shot_top + 10
        for ox, oy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, 1), (-1, 1), (1, -1)]:
            draw.text((tx + ox, ty + oy), tag, font=font_tag, fill=(20, 30, 45))
        draw.text((tx, ty), tag, font=font_tag, fill=(255, 255, 255))

    paste_shot(before, PAD_X, 'Before')
    paste_shot(after, PAD_X + shot_w + GAP_SHOTS, 'After')

    out_path = os.path.join(BASE, out_name)
    card.save(out_path, 'PNG', optimize=True)
    print('wrote', out_path, card.size)


cards = [
    ('scale-o-ba-before-main.jpg', 'scale-o-ba-after-main.jpg', 'FOR PROPERTY', 'scale-o-results-card-fixtures.png'),
    ('scale-o-ba-before-1.jpg', 'scale-o-ba-after-1.jpg', 'FOR PEOPLE', 'scale-o-results-card-utensils.png'),
    ('scale-o-ba-before-2.jpg', 'scale-o-ba-after-2.jpg', 'FOR PROPERTY', 'scale-o-results-card-face.png'),
    ('scale-o-ba-before-3.jpg', 'scale-o-ba-after-3.jpg', 'FOR PEOPLE', 'scale-o-results-card-hair.png'),
]

for b, a, label, out in cards:
    make_card(os.path.join(BASE, b), os.path.join(BASE, a), label, out)

print('done')
