# Content Integrity Analyzer

A powerful tool to analyze and verify the authenticity of digital content using advanced AI models.

## 🌟 Features

- **Text Analysis**: Analyze text content to determine if it's human-written or AI-generated
- **Image Analysis**: Upload images to check if they're human-created or AI-generated
- **Document Analysis**: Upload PDF or text documents for content verification
- **Real-time Results**: Get instant analysis with confidence scores
- **User Authentication**: Secure access with Firebase authentication
- **Cloud Storage**: Images stored securely in Cloudinary

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- Firebase account
- Cloudinary account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/content-integrity.git
cd content-integrity
```

2. **Install Frontend Dependencies**
```bash
cd frontend
npm install
```

3. **Install Backend Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

4. **Environment Setup**

Create `.env` files in both frontend and backend directories:

**Frontend (.env.local)**
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_BACKEND=http://localhost:5000
```

**Backend (.env)**
```
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Running the Application

1. **Start the Backend Server**
```bash
cd backend
python main.py
```

2. **Start the Frontend Development Server**
```bash
cd frontend
npm run dev
```

3. **Access the Application**
Open your browser and navigate to `http://localhost:3000`

## 📱 How to Use

### Text Analysis
1. Navigate to the Text Analysis page
2. Enter or paste your text content
3. Click "Analyze" to get results
4. View the confidence scores for human vs AI generation

### Image Analysis
1. Go to the Image Analysis page
2. Upload an image or take a photo using your camera
3. Click "Analyze Image"
4. Get detailed analysis results with confidence scores

### Document Analysis
1. Visit the Document Analysis page
2. Upload a PDF or text document
3. Wait for the analysis to complete
4. Review the results and confidence scores

## 🔒 Security Features

- Firebase Authentication for secure user access
- JWT token validation for API requests
- Secure file uploads to Cloudinary
- Protected API endpoints

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Flask, Python
- **Authentication**: Firebase
- **Storage**: Cloudinary
- **AI Models**: Custom-trained models for content analysis

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase for authentication services
- Cloudinary for image storage
- The open-source community for various libraries and tools

## 📞 Support

For support, email support@contentintegrity.com or open an issue in the repository.

## 📊 Roadmap

- [ ] Add video content analysis
- [ ] Implement batch processing
- [ ] Add more detailed analysis reports
- [ ] Support for more document formats
- [ ] Mobile app development 