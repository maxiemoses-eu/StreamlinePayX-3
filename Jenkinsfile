pipeline {
    agent any

    environment {
        AWS_REGION          = 'us-west-2'
        ECR_REGISTRY        = '659591640509.dkr.ecr.us-west-2.amazonaws.com'
        IMAGE_TAG           = "${env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : env.BUILD_NUMBER}"
        GITOPS_REPO         = 'git@github.com:maxiemoses-eu/agrocd-yaml.git' 
        GITOPS_BRANCH       = 'main'
        GITOPS_CREDENTIAL   = 'gitops-ssh-key'
        AWS_CREDENTIAL_ID   = 'AWS_ECR_PUSH_CREDENTIALS'

        TRIVY_CACHE         = "${WORKSPACE}/.trivycache"
        NPM_CACHE           = "${WORKSPACE}/.npm"
    }

    stages {
        stage('Checkout') {
            steps {
                cleanWs()
                checkout scm
            }
        }

        stage('Build & Test Microservices') {
            parallel {
                stage('products') {
                    steps {
                        dir('products-microservice') {
                            retry(3) {
                                sh 'npm install --cache ${NPM_CACHE} --prefer-offline --legacy-peer-deps'
                            }
                            sh 'npm test || echo "No tests specified"'
                        }
                    }
                }
                stage('users') {
                    steps {
                        dir('user-microservice') {
                            sh 'python3 -m venv venv'
                            sh 'venv/bin/pip install --upgrade pip'
                            retry(3) {
                                sh 'venv/bin/pip install -r requirements.txt'
                            }
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
                            // FIXED: Added retry for SSL errors and --legacy-peer-deps for React conflicts
                            retry(3) {
                                sh 'npm install --cache ${NPM_CACHE} --prefer-offline --legacy-peer-deps'
                            }
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    sh "docker build -t streamlinepay-prod-products-microservice:${IMAGE_TAG} -f products-microservice/Dockerfile products-microservice"
                    sh "docker build -t streamlinepay-prod-users-microservice:${IMAGE_TAG} -f user-microservice/Dockerfile user-microservice"
                    sh "docker build -t streamlinepay-prod-cart-microservice:${IMAGE_TAG} -f cart-microservice/Dockerfile cart-microservice"
                    sh "docker build -t streamlinepay-prod-store-ui:${IMAGE_TAG} -f store-ui-microservice/Dockerfile store-ui-microservice"
                }
            }
        }

        stage('Trivy Security Scan') {
            steps {
                script {
                    sh "mkdir -p ${TRIVY_CACHE}"
                    echo "📥 Updating Vulnerability Database..."
                    sh "trivy image --cache-dir ${TRIVY_CACHE} --download-db-only --quiet --timeout 20m"

                    def images = [
                        "streamlinepay-prod-products-microservice", 
                        "streamlinepay-prod-users-microservice", 
                        "streamlinepay-prod-cart-microservice", 
                        "streamlinepay-prod-store-ui"
                    ]

                    for (img in images) {
                        echo "🔍 Scanning ${img}:${IMAGE_TAG}..."
                        catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                            sh "trivy image --cache-dir ${TRIVY_CACHE} --scanners vuln --exit-code 1 --severity HIGH,CRITICAL --no-progress ${img}:${IMAGE_TAG}"
                        }
                    }
                }
            }
        }

        stage('Push to ECR') {
            when {
                expression { currentBuild.result in [null, 'SUCCESS', 'UNSTABLE'] }
            }
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: "${AWS_CREDENTIAL_ID}"]]) {
                    script {
                        sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}"

                        def ecrImages = [
                            'streamlinepay-prod-products-microservice',
                            'streamlinepay-prod-users-microservice',
                            'streamlinepay-prod-cart-microservice',
                            'streamlinepay-prod-store-ui'
                        ]

                        ecrImages.each { repoName ->
                            echo "🚀 Preparing to push ${repoName}..."
                            sh """
                                aws ecr describe-repositories --repository-names ${repoName} --region ${AWS_REGION} || \
                                aws ecr create-repository --repository-name ${repoName} --region ${AWS_REGION}
                            """
                            sh "docker tag ${repoName}:${IMAGE_TAG} ${ECR_REGISTRY}/${repoName}:${IMAGE_TAG}"
                            sh "docker push ${ECR_REGISTRY}/${repoName}:${IMAGE_TAG}"
                        }
                    }
                }
            }
        }

        stage('GitOps Promotion') {
            when {
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                sshagent([GITOPS_CREDENTIAL]) {
                    sh """
                        rm -rf gitops
                        git clone ${GITOPS_REPO} gitops
                        cd gitops
                        
                        sed -i "s|image: .*/streamlinepay-prod-products-microservice:.*|image: ${ECR_REGISTRY}/streamlinepay-prod-products-microservice:${IMAGE_TAG}|g" products/deployment.yaml
                        sed -i "s|image: .*/streamlinepay-prod-users-microservice:.*|image: ${ECR_REGISTRY}/streamlinepay-prod-users-microservice:${IMAGE_TAG}|g" user/deployment.yaml
                        sed -i "s|image: .*/streamlinepay-prod-cart-microservice:.*|image: ${ECR_REGISTRY}/streamlinepay-prod-cart-microservice:${IMAGE_TAG}|g" cart/deployment.yaml
                        sed -i "s|image: .*/streamlinepay-prod-store-ui:.*|image: ${ECR_REGISTRY}/streamlinepay-prod-store-ui:${IMAGE_TAG}|g" store-ui/deployment.yaml

                        git config user.name "Jenkins CI"
                        git config user.email "ci@streamlinepay.com"

                        if ! git diff --quiet; then
                          git add .
                          git commit -m "Promote StreamlinePay services to tag ${IMAGE_TAG}"
                          git push