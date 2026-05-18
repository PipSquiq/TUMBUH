import cv2
import requests
from ultralytics import YOLO

# 1. Load Model
# Arahkan ke folder training terbaru (v2)
model = YOLO(r'C:\Users\Rafid\runs\detect\train_gabungan_v2\weights\best.pt')

# 2. Konfigurasi Backend
# Ganti localhost ke URL Railway jika sudah dipush
BASE_URL = "http://localhost:3000/ingredients/scan/"

cap = cv2.VideoCapture(0)
is_locked = False 

print("Sistem Dimulai. Tekan 'r' untuk reset deteksi, 'q' untuk keluar.")

while cap.isOpened():
    success, frame = cap.read()
    if not success:
        break

    # Jalankan Prediksi
    results = model(frame, conf=0.85)
    
    for r in results:
        for box in r.boxes:
            # Ambil data label dan confidence
            label_raw = model.names[int(box.cls[0])]
            label_display = label_raw.capitalize()
            conf_percent = int(box.conf[0] * 100)
            
            # Format teks sesuai prototype: "Ikan Cocok 95%"
            teks_visual = f"{label_display} Cocok {conf_percent}%"
            
            # Koordinat Kotak
            x1, y1, x2, y2 = map(int, box.xyxy[0])

            # --- VISUALISASI ---
            # Warna Hijau (0, 255, 0)
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, teks_visual, (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

            # --- INTEGRASI BACKEND (LOCK LOGIC) ---
            if conf_percent > 80 and not is_locked:
                print(f"Sistem Mengunci: {teks_visual}")
                try:
                    # Mengirim ke NestJS (menggunakan label_raw agar matching di DB)
                    response = requests.get(f"{BASE_URL}{label_raw}")
                    
                    if response.status_code == 200:
                        data = response.json()
                        print(f"Berhasil! Protein: {data.get('proteinLevel')}")
                        is_locked = True # Kunci agar tidak spam request
                    else:
                        print(f"Bahan {label_raw} tidak ada di database.")
                except Exception as e:
                    print("Gagal koneksi ke backend:", e)

    # Tampilkan Indikator Status di Layar
    status_text = "STATUS: TERKUNCI" if is_locked else "STATUS: SCANNING..."
    status_color = (0, 0, 255) if is_locked else (255, 255, 255)
    cv2.putText(frame, status_text, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, status_color, 2)

    cv2.imshow("Smart Food Digital Signage - AI Detector", frame)
    
    key = cv2.waitKey(1)
    if key & 0xFF == ord("r"):
        is_locked = False
        print("Sistem di-refresh, siap scan bahan baru.")
    elif key & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()