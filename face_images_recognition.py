import face_recognition


class Recognition:
    def __init__(self, image, data_base_images):
        self.image = image
        self.data_base_images = data_base_images
        self.is_authorize = self.is_person_in_database(image)
        self.match_photo

    def is_same_person_in_pictures(self, image1, image2):
        known_face = face_recognition.face_encodings(face_recognition.load_image_file(image1))[0]
        unknown_face = face_recognition.face_encodings(face_recognition.load_image_file(image2))
        return face_recognition.compare_faces(known_face, unknown_face)[0]

    def is_person_in_database(self, check_image):
        for image in self.data_base_images:
            if self.is_same_person_in_pictures(check_image, image):
                self.match_photo = image
                return True
        return False

    def is_person_authorize(self):
        return self.is_authorize

    def match_image(self):
        return self.match_photo

