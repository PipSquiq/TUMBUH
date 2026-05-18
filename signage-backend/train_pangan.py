from ultralytics import YOLO
import os

if __name__ == '__main__':
    # 1. Path ke data.yaml di folder yang baru saja terdownload
    data_path = r'C:\Users\Rafid\signage-backend\1850_3_resplit-1\data.yaml'
    
    # 2. Gunakan model telur v1 sebagai base (Transfer Learning)
    model = YOLO(r'C:\Users\Rafid\runs\detect\train3\weights\best.pt') 
    
    # 3. Jalankan Training dengan RTX 4060
    model.train(
        data=data_path, 
        epochs=100,    # Dengan GPU, 100 epoch akan terasa sangat cepat
        imgsz=640, 
        device=0,      # WAJIB 0 untuk RTX 4060
        batch=16,      # Ukuran batch optimal untuk VRAM 8GB
        workers=4,     # Mempercepat proses baca gambar dari SSD
        name='train_gabungan_v2'
    )