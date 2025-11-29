import os
from PIL import Image, ImageEnhance

def create_variants():
    input_file = "enemysprite.png"
    
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found in {os.getcwd()}")
        return

    try:
        # Load original image
        original = Image.open(input_file).convert("RGBA")
        print(f"Loaded {input_file} size: {original.size}")

        # 1. Create Recolored Variant (Red tint for "Fast/Strong" enemy)
        # Split channels
        r, g, b, a = original.split()
        
        # Enhance Red channel, reduce Green/Blue to make it reddish
        r = r.point(lambda i: i * 1.5)
        g = g.point(lambda i: i * 0.5)
        b = b.point(lambda i: i * 0.5)
        
        variant = Image.merge("RGBA", (r, g, b, a))
        variant_file = "enemy_variant.png"
        variant.save(variant_file)
        print(f"Created {variant_file}")

        # 2. Create Boss Variant (2x size)
        # We can also give it a slight purple tint or just keep it original but bigger
        # Let's just make it bigger as requested, maybe slightly darker to look menacing
        
        boss_width = original.width * 2
        boss_height = original.height * 2
        
        boss = original.resize((boss_width, boss_height), Image.NEAREST)
        
        # Optional: Make boss slightly darker
        enhancer = ImageEnhance.Brightness(boss)
        boss = enhancer.enhance(0.8)
        
        boss_file = "boss_sprite.png"
        boss.save(boss_file)
        print(f"Created {boss_file} size: {boss.size}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    create_variants()
