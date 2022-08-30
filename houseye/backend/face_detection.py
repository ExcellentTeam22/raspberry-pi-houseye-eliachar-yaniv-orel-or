import cv2
import numpy as np
import recognition as reco
import os
import requests
import time


def detect_face():
    """
    Detect face within the video frames and send request to the server for identification.
    """
    face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')

    cap = cv2.VideoCapture(0)

    while True:
        ret, img = cap.read()
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5, minSize=(150, 150), maxSize=(300, 300))
        cv2.imshow('Preview', img)  # Display the Video
        start = time.time()
        end = start + 4
        for (x, y, w, h) in faces:
            face_img_gray = gray[y:y+h, x:x+w]
            face_img_color = img[y:y+h, x:x+w]
            laplacian_var = cv2.Laplacian(face_img_gray, cv2.CV_64F).var()
            print(laplacian_var)
            print(end - start)
            if laplacian_var > 80  and end - start > 3:  # avoid blur frame capture
                face = os.path.join(os.getcwd(), "face_detect.jpeg")  # Tell the program where we have saved the face images
                cv2.imwrite(face, img)
                url = 'http://127.0.0.1:5000'
                requests.get(url)
                files = {'media': open(face, 'rb')}
                end = time.time()
                break


        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == '__main__':
    detect_face()