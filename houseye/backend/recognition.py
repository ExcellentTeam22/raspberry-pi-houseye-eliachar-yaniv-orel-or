import base64

# import face_recognition
from PIL import Image
import numpy as np
# import cv2
import flask
import requests
import datetime
import os


class Recognition:
    def __init__(self, image, data_base_images):
        """
        :param image:
        :param data_base_images:
        """
        self.image = image
        self.data_base_images = data_base_images
        self.match_photo = ""
        self.is_authorize = self.is_person_in_database(image)


    def is_same_person_in_pictures(self, image1, image2):
        """
        :param image1: string path to image1.
        :param image2: path to image.
        :return: True if it recognizes the same person in both photos.
        """
        response = requests.get(image2.generate_signed_url(datetime.timedelta(seconds=300), method='GET'))
        path = image2.path.split('/')
        path = path[-1].split('%2F')
        path = path[-1]
        open(path, "wb").write(response.content)
        self.match_photo = "backend/resources/" + path
        try:
            known_face = face_recognition.face_encodings(face_recognition.load_image_file(image1))[0]
            unknown_face = face_recognition.face_encodings(face_recognition.load_image_file(path))
            rs = face_recognition.compare_faces(known_face, unknown_face)[0]
            return rs
        except IndexError as e:
            print("No faces detected.")
        finally:
            os.remove(path)

    def is_person_in_database(self, check_image):
        """
        :param check_image: Image of person.
        :return: True if the person image is already in the database or not
        """
        for image in self.data_base_images:
            if self.is_same_person_in_pictures(check_image, image):
                return True
        return False

    def is_person_authorize(self):
        """
        :return: Is the person face in the database or not.
        """
        return self.is_authorize

    def match_image(self):
        """
        :return: path to image photo in the database.
        """
        return self.match_photo
