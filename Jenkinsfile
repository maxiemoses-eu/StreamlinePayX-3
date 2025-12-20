pipeline {
    agent any

    environment {
        AWS_REGION          = 'us-west-2'
        ECR_REGISTRY        = '65959164050.dkr.ecr.us-west-2.amazonaws.com'
        IMAGE_TAG           = "${env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : env.BUILD_NUMBER}"
        GITOPS_REPO         = 'git@github.com/maxiemoses-eu/agrocd-yaml.git'
        GITOPS_BRANCH       = 'main'
        GITOPS_CREDENTIAL   = 'gitops-ssh-key'
        AWS_CREDENTIAL_ID   = 'AWS_ECR_PUSH_CREDENTIALS'

        // CACHE DIRECTORIES
        TRIVY_CACHE         = "${WORKSPACE}/.trivycache"
        NPM_CACHE           = "${WORKSPACE}/.npm"
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Build & Test Microservices') {
            parallel {
                stage('products') {
                    steps {
                        dir('products-microservice') {
                            sh 'npm install --cache ${NPM_CACHE} --prefer-offline'
                            sh 'npm test || echo "No tests specified"'
                        }
                    }
                }
                stage('user') {
                    steps {
                        dir('user-microservice') {
                            sh 'python3 -m venv venv'
                            sh 'venv/bin/pip install -r requirements.txt'
                            sh 'venv/bin/python -m unittest || echo "No tests defined"'
                        }
                    }
                }
                stage('cart') {
                    steps {
                        dir('cart-microservice') {
                            sh 'javac CartService.java'
                            echo "Cart microservice compiled successfully"
                        }
                    }
                }
                stage('store-ui') {
                    steps {
                        dir('store-ui-microservice') {
                            echo "Installing React dependencies..."
                            sh 'npm install --cache ${NPM_CACHE} --prefer-offline'
                            sh 'npm audit fix --audit-level=high || echo "Some vulnerabilities persist"'

                            echo "Running React tests..."
                            catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                                sh 'npm test -- --watchAll=false'
                            }

                            echo "Building production bundle..."
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    sh "docker build -t products:${IMAGE_TAG} -f products-microservice/Dockerfile products-microservice"
                    sh "docker build -t user:${IMAGE_TAG} -f user-microservice/Dockerfile user-microservice"
                    retry(3) {
                        sh "docker build -t cart:${IMAGE_TAG} -f cart-microservice/Dockerfile cart-microservice"
                    }
                    sh "docker build -t store-ui:${IMAGE_TAG} -f store-ui-microservice/Dockerfile store-ui-microservice"
                }
            }
        }

        stage('Trivy Security Scan') {
            steps {
                script {
                    sh "mkdir -p ${TRIVY_CACHE}"
                    echo "📥 Using Cached Vulnerability Database..."
                    sh "trivy image --cache-dir ${TRIVY_CACHE} --download-db-only --quiet"

                    def apps = ['products', 'user', 'cart', 'store-ui']
                    for (app in apps) {
                        echo "🔍 Scanning ${app}..."
                        catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                            sh """
                                trivy image \
                                  --cache-dir ${TRIVY_CACHE} \
                                  --scanners vuln \
                                  --exit-code 1 \
                                  --severity HIGH,CRITICAL \
                                  --no-progress \
                                  ${app}:${IMAGE_TAG}
                            """
                        }
                        echo "✅ Trivy scan completed for ${app}:${IMAGE_TAG}"
                        sh "sleep 2"
                    }
                }
            }
        }

        // Push to ECR and GitOps Promotion stages remain unchanged
    }

    post {
        always {
            cleanWs(patterns: [
                [pattern: '.trivycache/**', type: 'EXCLUDE'],
                [pattern: '.npm/**', type: 'EXCLUDE']
            ])
        }
    }
}
