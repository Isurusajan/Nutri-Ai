import io
import re
import numpy as np
import cv2
from typing import Tuple, Optional

class FoodLabelOCRService:
    """
    OpenCV-based food package image preprocessing and optical character
    recognition service for ingredient labels (SRS REQ-1.1 & Section 3.1).
    """

    def preprocess_image(self, image_bytes: bytes) -> Tuple[np.ndarray, dict]:
        """
        Applies OpenCV computer vision pipeline:
        1. Color conversion to grayscale
        2. Bilateral filtering for packaging glare & noise reduction
        3. Adaptive Gaussian thresholding for high-contrast text segmentation
        4. Morphological gradient for text bounding region localization
        """
        # Decode image from memory bytes
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Invalid image file or unsupported image format.")

        orig_h, orig_w = img.shape[:2]

        # 1. Grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 2. Bilateral filtering (preserves edges while removing specular highlights)
        denoised = cv2.bilateralFilter(gray, 9, 75, 75)

        # 3. Adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )

        # 4. Text region contour detection
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (18, 3))
        dilated = cv2.dilate(cv2.bitwise_not(thresh), kernel, iterations=2)
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        bounding_boxes = []
        for c in contours:
            x, y, w, h = cv2.boundingRect(c)
            aspect_ratio = float(w) / max(h, 1)
            if w > 35 and 8 < h < 140 and aspect_ratio > 1.1:
                bounding_boxes.append({"x": int(x), "y": int(y), "w": int(w), "h": int(h)})

        # 5. Measure edge density to detect blank paper / plain surfaces
        edges = cv2.Canny(gray, 100, 200)
        edge_density = float(np.sum(edges > 0)) / float(max(orig_w * orig_h, 1))

        # Blank paper detection: plain paper or solid background has < 2 text contours and edge_density < 0.005
        has_text_content = len(bounding_boxes) >= 2 and edge_density >= 0.005

        metrics = {
            "original_width": orig_w,
            "original_height": orig_h,
            "detected_text_regions": len(bounding_boxes),
            "edge_density": round(edge_density, 5),
            "has_text_content": has_text_content,
            "preprocessing": "bilateral_filter + adaptive_gaussian_threshold",
        }

        return thresh, metrics

    def isolate_ingredients_section(self, raw_text: str) -> str:
        """
        Locates and extracts the ingredient list from cluttered food packaging text
        (suppressing nutrition tables, product category codes, foreign script translations,
        and manufacturer addresses).
        """
        if not raw_text or not raw_text.strip():
            return ""

        idx = -1
        for kw in ["ingredients:", "ingredients :", "ingredient:", "contents:", "ingredients"]:
            p = raw_text.lower().find(kw)
            if p != -1:
                idx = p
                break

        if idx != -1:
            snippet = raw_text[idx:].strip()
            clean_words = []
            for word in snippet.split():
                # Stop if non-latin / Arabic text is reached
                if any(ord(c) > 0x0590 for c in word):
                    break
                # Stop if manufacturer / marketing footer is reached
                if word.lower().startswith((
                    "manufactured", "distrib", "mfd", "batch:", "mrp",
                    "best before", "lic.no", "for gcc", "product of"
                )):
                    break
                clean_words.append(word)

            extracted = " ".join(clean_words).strip()
            # Clean trailing punctuation
            extracted = re.sub(r'[\s\.\,\;]+$', '', extracted)
            if len(extracted) > 20:
                return extracted

        return raw_text.strip()

    async def extract_ingredients_text(self, image_bytes: bytes) -> Tuple[str, dict]:
        """
        Extracts ingredient text from packaging photo:
        Preprocesses with OpenCV and runs real Windows OCR engine.
        Returns empty string if blank surface / no text detected.
        """
        processed_img, metrics = self.preprocess_image(image_bytes)

        # 1. Real OCR extraction using native Windows OCR
        try:
            import winocr
            from PIL import Image
            import io

            pil_img = Image.open(io.BytesIO(image_bytes))
            # Convert to RGB if needed
            if pil_img.mode != 'RGB':
                pil_img = pil_img.convert('RGB')

            ocr_res = await winocr.recognize_pil(pil_img, 'en')
            raw_text = ocr_res.text if hasattr(ocr_res, 'text') else str(ocr_res)
            
            # Clean up text
            raw_text = raw_text.strip()
            if raw_text:
                metrics["ocr_engine"] = "windows_native_ocr"
                metrics["extracted_char_count"] = len(raw_text)
                metrics["raw_ocr_text"] = raw_text
                
                # Isolate clean ingredients section
                clean_ingredients = self.isolate_ingredients_section(raw_text)
                return clean_ingredients, metrics
        except Exception as ocr_err:
            print("Native OCR error:", ocr_err)

        # 2. If OCR extracted nothing, verify if image is blank
        if not metrics.get("has_text_content", False):
            return "", metrics

        # Fallback if text regions detected but OCR engine failed
        return "", metrics
