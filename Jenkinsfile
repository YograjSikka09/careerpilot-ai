pipeline {
  agent any
  environment {
    IMAGE_TAG = "careerpilot-ai:${BUILD_NUMBER}"
  }
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Backend Test') {
      steps {
        dir('backend') {
          sh 'mvn -B test'
        }
      }
    }
    stage('AI Service Syntax') {
      steps { sh 'python3 -m py_compile ai-service/main.py' }
    }
    stage('Container Build') {
      steps { sh 'docker compose build' }
    }
  }
  post {
    always { echo 'CareerPilot pipeline finished. Review test output and build logs.' }
  }
}
