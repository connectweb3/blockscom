import os
from PIL import Image

# Configuration
FRAME_WIDTH = 128
FRAME_HEIGHT = 128
FRAMES_PER_ROW = 5
ROW_WIDTH = FRAME_WIDTH * FRAMES_PER_ROW # 640

# File mapping (Order matters!)
files = [
    "idle1.png", "idle2.png", "idle3.png", "idle4.png",
    "walking1.png", "walking2.png", "walking3.png", "walking4.png",
    "running1.png", "running2.png", "running3.png", "running4.png",
    "attack1.png", "attack2.png", "attack3.png", "attack4.png",
    "attack5.png", "attack6.png", "attack7.png", "attack8.png"
]

# Create blank image
total_width = ROW_WIDTH
total_height = len(files) * FRAME_HEIGHT
spritesheet = Image.new("RGBA", (total_width, total_height))

print(f"Creating spritesheet: {total_width}x{total_height}")

for index, filename in enumerate(files):
    if os.path.exists(filename):
        try:
            img = Image.open(filename)
            # Resize if necessary (though user said they are 640x128)
            if img.size != (ROW_WIDTH, FRAME_HEIGHT):
                print(f"Warning: {filename} size is {img.size}, expected {(ROW_WIDTH, FRAME_HEIGHT)}")
                img = img.resize((ROW_WIDTH, FRAME_HEIGHT))
            
            spritesheet.paste(img, (0, index * FRAME_HEIGHT))
            print(f"Added {filename} at row {index}")
        except Exception as e:
            print(f"Error processing {filename}: {e}")
    else:
        print(f"Error: File {filename} not found!")

output_file = "character_spritesheet.png"
spritesheet.save(output_file)
print(f"Saved spritesheet to {output_file}")
