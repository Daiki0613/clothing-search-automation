# V4

import cv2
import numpy as np
from tensorflow.keras.applications import VGG16
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.vgg16 import preprocess_input
from sklearn.metrics.pairwise import cosine_similarity
import torch
from torchvision import transforms
from PIL import Image
import segmentation_models_pytorch as smp

class ClothingSimilarityAnalyzer:
    def __init__(self):
        # Load pre-trained models
        self.feature_extractor = VGG16(weights='imagenet', include_top=False)
        
        # Load segmentation model
        self.segmentation_model = smp.Unet(
            encoder_name="resnet34",
            encoder_weights="imagenet",
            in_channels=3,
            classes=1,
        )
        
        # Load pre-trained weights for clothing segmentation
        # You'll need to download these weights or train your own
        # self.segmentation_model.load_state_dict(torch.load('clothing_segmentation_weights.pth'))
        self.segmentation_model.eval()

    def segment_clothing(self, img):
        """Segment the clothing item from the image"""
        # Convert to PIL Image if it's not already
        if not isinstance(img, Image.Image):
            img = Image.fromarray(img)

        # Prepare image for segmentation
        transform = transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                              std=[0.229, 0.224, 0.225])
        ])
        
        input_tensor = transform(img).unsqueeze(0)
        
        with torch.no_grad():
            mask = self.segmentation_model(input_tensor)
            mask = torch.sigmoid(mask)
            mask = (mask > 0.5).float()
            mask = mask.squeeze().numpy()

        # Resize mask back to original size
        mask = cv2.resize(mask, (img.size[0], img.size[1]))
        return mask

    def extract_features(self, img):
        """Extract features from the image using VGG16"""
        img = img.resize((224, 224))
        x = image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x = preprocess_input(x)
        features = self.feature_extractor.predict(x)
        return features.flatten()

    def calculate_color_histogram_similarity(self, img1, img2):
        """Calculate color histogram similarity"""
        hist1 = cv2.calcHist([np.array(img1)], [0, 1, 2], None, [8, 8, 8], 
                            [0, 256, 0, 256, 0, 256])
        hist2 = cv2.calcHist([np.array(img2)], [0, 1, 2], None, [8, 8, 8], 
                            [0, 256, 0, 256, 0, 256])
        
        hist1 = cv2.normalize(hist1, hist1).flatten()
        hist2 = cv2.normalize(hist2, hist2).flatten()
        
        return cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)

    def calculate_similarity_score(self, img1_path, img2_path):
        """Calculate overall similarity score between two clothing items"""
        # Load images
        img1 = Image.open(img1_path).convert('RGB')
        img2 = Image.open(img2_path).convert('RGB')

        # Segment clothing items
        mask1 = self.segment_clothing(img1)
        mask2 = self.segment_clothing(img2)

        # Apply masks to original images
        img1_masked = Image.fromarray((np.array(img1) * mask1[:,:,np.newaxis]).astype(np.uint8))
        img2_masked = Image.fromarray((np.array(img2) * mask2[:,:,np.newaxis]).astype(np.uint8))

        # Extract features from masked images
        features1 = self.extract_features(img1_masked)
        features2 = self.extract_features(img2_masked)

        # Calculate different similarity metrics
        feature_similarity = cosine_similarity(features1.reshape(1, -1), 
                                            features2.reshape(1, -1))[0][0]
        
        color_similarity = self.calculate_color_histogram_similarity(img1_masked, img2_masked)

        # Calculate shape similarity using mask contours
        shape_similarity = self.calculate_shape_similarity(mask1, mask2)

        # Weighted combination of similarities
        weights = {
            'feature': 0.22,
            'color': 0.77,
            'shape': 0.01
        }

        total_similarity = (
            weights['feature'] * feature_similarity +
            weights['color'] * color_similarity +
            weights['shape'] * shape_similarity
        )

        return {
            'total_similarity': total_similarity,
            'feature_similarity': feature_similarity,
            'color_similarity': color_similarity,
            'shape_similarity': shape_similarity
        }

    def calculate_shape_similarity(self, mask1, mask2):
        """Calculate similarity between shapes using contours"""
        # Convert masks to uint8
        mask1 = (mask1 * 255).astype(np.uint8)
        mask2 = (mask2 * 255).astype(np.uint8)

        # Find contours
        contours1, _ = cv2.findContours(mask1, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        contours2, _ = cv2.findContours(mask2, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # Get largest contour from each
        if len(contours1) > 0 and len(contours2) > 0:
            contour1 = max(contours1, key=cv2.contourArea)
            contour2 = max(contours2, key=cv2.contourArea)

            # Calculate Hu Moments
            moments1 = cv2.HuMoments(cv2.moments(contour1)).flatten()
            moments2 = cv2.HuMoments(cv2.moments(contour2)).flatten()

            # Calculate similarity using logarithmic transformed Hu Moments
            similarity = 0
            for m1, m2 in zip(moments1, moments2):
                similarity += abs(np.log(abs(m1)) - np.log(abs(m2)))
            
            # Convert to similarity score (0 to 1)
            similarity = 1 / (1 + similarity)
            return similarity
        
        return 0.0

# Usage
def analyze_clothing_similarity(target_image_path, found_image_path):
    analyzer = ClothingSimilarityAnalyzer()
    similarity_scores = analyzer.calculate_similarity_score(target_image_path, found_image_path)
    
    print("\n=== Similarity Analysis ===")
    print(f"Overall Similarity: {similarity_scores['total_similarity']*100:.2f}%")
    print(f"Feature Similarity: {similarity_scores['feature_similarity']*100:.2f}%")
    print(f"Color Similarity: {similarity_scores['color_similarity']*100:.2f}%")
    print(f"Shape Similarity: {similarity_scores['shape_similarity']*100:.2f}%")
    
    return similarity_scores

# Add this to your existing code
target_image_path = "../../public/marshall_wace_hoodie.jpeg"
found_image_path = "../../public/result_marshall_wace.png"

similarity_scores = analyze_clothing_similarity(target_image_path, found_image_path)