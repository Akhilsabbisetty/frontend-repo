pipeline {
  agent any

  environment {
    IMAGE = "13.201.141.194:5000/frontend"
    VERSION = "${BUILD_NUMBER}"
  }

  stages {

    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Build UI') {
      steps {
        sh '''
        npm install
        npm run build
        '''
      }
    }

    stage('Build Docker Image') {
      steps {
        sh 'docker build -t $IMAGE:$VERSION .'
      }
    }

    stage('Push Docker Image') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'nexus-creds',
          usernameVariable: 'USER',
          passwordVariable: 'PASS'
        )]) {
          sh '''
          echo "$PASS" | docker login 13.201.141.194:5000 -u "$USER" --password-stdin
          docker push $IMAGE:$VERSION
          '''
        }
      }
    }
  }
}