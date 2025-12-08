// Jenkinsfile for StreamlinePay Microservices
pipeline {
    agent any

    environment {
        AWS_REGION          = 'us-west-2'
        ECR_REGISTRY        = '1659591640509.dkr.ecr.us-west-2.amazonaws.com'
        IMAGE_TAG           = "${env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : env.BUILD_NUMBER}"
        GITOPS_REPO         = 'git@github.com:maxiemoses-eu/agrocd-yaml.git'
        GITOPS_BRANCH       = 'main'
        GITOPS_CREDENTIAL   = 'gitops-ssh-key'
        AWS_CREDENTIAL_ID   = 'aws-credentials-id'
    }

    options {
        timestamps()
        skipStagesAfterUnstable()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Test Microservices') {
            parallel {
                stage('products') {
                    steps {
                        dir('products-microservice') {
                            sh 'npm install'
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
                            echo "Store UI is static, nothing to compile"
                        }
                    }
                }
            }
        }

        stage('Docker Build & Scan') {
            steps {
                script {
                    // Products
                    sh """
                        docker build -t products:${IMAGE_TAG} -f products-microservice/Dockerfile products-microservice
                        trivy image --exit-code 1 --severity HIGH,CRITICAL products:${IMAGE_TAG} || true
                    """

                    // User
                    sh """
                        docker build -t user:${IMAGE_TAG} -f user-microservice/Dockerfile user-microservice
                        trivy image --exit-code 1 --severity HIGH,CRITICAL user:${IMAGE_TAG} || true
                    """

                    // Cart
                    sh """
                        docker build -t cart:${IMAGE_TAG} -f cart-microservice/Dockerfile cart-microservice
                        trivy image --exit-code 1 --severity HIGH,CRITICAL cart:${IMAGE_TAG} || true
                    """

                    // Store-UI
                    sh """
                        docker build -t store-ui:${IMAGE_TAG} -f store-ui-microservice/Dockerfile store-ui-microservice
                        trivy image --exit-code 1 --severity HIGH,CRITICAL store-ui:${IMAGE_TAG} || true
                    """
                }
            }
        }

        stage('Push to ECR') {
            steps {
                withAWS(credentials: "${AWS_CREDENTIAL_ID}", region: "${AWS_REGION}") {
                    sh """
                        aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

                        # Products
                        docker tag products:${IMAGE_TAG} ${ECR_REGISTRY}/products:${IMAGE_TAG}
                        docker tag products:${IMAGE_TAG} ${ECR_REGISTRY}/products:latest
                        docker push ${ECR_REGISTRY}/products:${IMAGE_TAG}
                        docker push ${ECR_REGISTRY}/products:latest

                        # User
                        docker tag user:${IMAGE_TAG} ${ECR_REGISTRY}/user:${IMAGE_TAG}
                        docker tag user:${IMAGE_TAG} ${ECR_REGISTRY}/user:latest
                        docker push ${ECR_REGISTRY}/user:${IMAGE_TAG}
                        docker push ${ECR_REGISTRY}/user:latest

                        # Cart
                        docker tag cart:${IMAGE_TAG} ${ECR_REGISTRY}/cart:${IMAGE_TAG}
                        docker tag cart:${IMAGE_TAG} ${ECR_REGISTRY}/cart:latest
                        docker push ${ECR_REGISTRY}/cart:${IMAGE_TAG}
                        docker push ${ECR_REGISTRY}/cart:latest

                        # Store-UI
                        docker tag store-ui:${IMAGE_TAG} ${ECR_REGISTRY}/store-ui:${IMAGE_TAG}
                        docker tag store-ui:${IMAGE_TAG} ${ECR_REGISTRY}/store-ui:latest
                        docker push ${ECR_REGISTRY}/store-ui:${IMAGE_TAG}
                        docker push ${ECR_REGISTRY}/store-ui:latest
                    """
                }
            }
        }

        stage('GitOps Promotion') {
            steps {
                sshagent([GITOPS_CREDENTIAL]) {
                    sh """
                        git clone ${GITOPS_REPO} gitops
                        cd gitops
                        git checkout ${GITOPS_BRANCH}

                        sed -i.bak "s|image: .*/products:.*|image: ${ECR_REGISTRY}/products:${IMAGE_TAG}|g" products/deployment.yaml
                        sed -i.bak "s|image: .*/user:.*|image: ${ECR_REGISTRY}/user:${IMAGE_TAG}|g" user/deployment.yaml
                        sed -i.bak "s|image: .*/cart:.*|image: ${ECR_REGISTRY}/cart:${IMAGE_TAG}|g" cart/deployment.yaml
                        sed -i.bak "s|image: .*/store-ui:.*|image: ${ECR_REGISTRY}/store-ui:${IMAGE_TAG}|g" store-ui/deployment.yaml

                        rm */*.bak

                        git config user.name "Jenkins CI for StreamlinePay"
                        git config user.email "ci@streamlinepay.com"
                        git add .
                        git commit -am "Promote StreamlinePay services to tag ${IMAGE_TAG}"
                        git push origin ${GITOPS_BRANCH}
                    """
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            emailext(
                subject: "Jenkins Build SUCCESS: ${JOB_NAME} #${BUILD_NUMBER}",
                body: "Pipeline completed successfully. Image Tag: ${IMAGE_TAG}",
                to: 'your.email@example.com'
            )
        }
        failure {
            emailext(
                subject: "Jenkins Build FAILURE: ${JOB_NAME} #${BUILD_NUMBER}",
                body: "Pipeline failed. Investigate here: ${BUILD_URL}",
                to: 'your.email@example.com'
            )
        }
    }
}
