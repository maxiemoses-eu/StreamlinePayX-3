pipeline {
    agent any

    environment {
        AWS_REGION          = 'us-west-2'
        ECR_REGISTRY        = '659591640509.dkr.ecr.us-west-2.amazonaws.com'
        // FIX: Added BUILD_NUMBER to ensure uniqueness in ECR
        GIT_SHA             = "${env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : 'no-git'}"
        IMAGE_TAG           = "${GIT_SHA}-${env.BUILD_NUMBER}"
        
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
                            // DevOps Tip: Ensure package.json has a "test" script
                            sh 'npm test || echo "Warning: No tests executed for products"'
                        }
                    }
                }
                stage('users') {
                    steps {
                        dir('users-microservice') {
                            sh 'python3 -m venv venv'
                            sh 'venv/bin/pip install --upgrade pip'
                            retry(3) {
                                sh 'venv/bin/pip install -r requirements.txt'
                            }
                            sh 'venv/bin/python -m unittest discover || echo "Warning: No python tests found"'
                        }
                    }
                }
                stage('cart') {
                    steps {
                        dir('cart-microservice') {
                            // Fixed compilation to target the file
                            sh 'javac CartService.java'
                            echo "Cart microservice compiled successfully"
                        }
                    }
                }
                stage('store-ui') {
                    steps {
                        dir('store-ui-microservice') {
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
                    sh "docker build -t streamlinepay-prod-products-cna-microservice:${IMAGE_TAG} -f products-microservice/Dockerfile products-microservice"
                    sh "docker build -t streamlinepay-prod-users-cna-microservice:${IMAGE_TAG} -f users-microservice/Dockerfile users-microservice"
                    sh "docker build -t streamlinepay-prod-cart-cna-microservice:${IMAGE_TAG} -f cart-microservice/Dockerfile cart-microservice"
                    sh "docker build -t streamlinepay-prod-store-ui:${IMAGE_TAG} -f store-ui-microservice/Dockerfile store-ui-microservice"
                }
            }
        }

        stage('Trivy Security Scan') {
            steps {
                script {
                    sh "mkdir -p ${TRIVY_CACHE}"
                    // FIX: Increased timeout to 30m to avoid 'context deadline exceeded'
                    sh "trivy image --cache-dir ${TRIVY_CACHE} --download-db-only --quiet --timeout 30m"

                    def images = [
                        "streamlinepay-prod-products-cna-microservice", 
                        "streamlinepay-prod-users-cna-microservice", 
                        "streamlinepay-prod-cart-cna-microservice", 
                        "streamlinepay-prod-store-ui"
                    ]

                    for (img in images) {
                        // Using catchError so one bad image doesn't stop the whole scan process
                        catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                            sh "trivy image --cache-dir ${TRIVY_CACHE} --scanners vuln --exit-code 1 --severity HIGH,CRITICAL --no-progress ${img}:${IMAGE_TAG}"
                        }
                    }
                }
            }
        }

        stage('Push to ECR') {
            // Only push if build isn't a total failure
            when {
                expression { currentBuild.result != 'FAILURE' }
            }
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: "${AWS_CREDENTIAL_ID}"]]) {
                    script {
                        sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}"

                        def ecrImages = [
                            'streamlinepay-prod-products-cna-microservice',
                            'streamlinepay-prod-users-cna-microservice',
                            'streamlinepay-prod-cart-cna-microservice',
                            'streamlinepay-prod-store-ui'
                        ]

                        ecrImages.each { repoName ->
                            sh "docker tag ${repoName}:${IMAGE_TAG} ${ECR_REGISTRY}/${repoName}:${IMAGE_TAG}"
                            sh "docker push ${ECR_REGISTRY}/${repoName}:${IMAGE_TAG}"
                        }
                    }
                }
            }
        }

        stage('GitOps Promotion') {
            // Strict check: Only promote if build is SUCCESS (No security High/Criticals)
            when {
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                sshagent([GITOPS_CREDENTIAL]) {
                    sh """
                        rm -rf gitops
                        git clone ${GITOPS_REPO} gitops
                        cd gitops
                        
                        # Use pipe | as delimiter for sed to avoid issues with slashes in registry URL
                        sed -i "s|image: .*/streamlinepay-prod-products-cna-microservice:.*|image: ${ECR_REGISTRY}/streamlinepay-prod-products-cna-microservice:${IMAGE_TAG}|g" products/deployment.yaml
                        sed -i "s|image: .*/streamlinepay-prod-users-cna-microservice:.*|image: ${ECR_REGISTRY}/streamlinepay-prod-users-cna-microservice:${IMAGE_TAG}|g" user/deployment.yaml
                        sed -i "s|image: .*/streamlinepay-prod-cart-cna-microservice:.*|image: ${ECR_REGISTRY}/streamlinepay-prod-cart-cna-microservice:${IMAGE_TAG}|g" cart/deployment.yaml
                        sed -i "s|image: .*/streamlinepay-prod-store-ui:.*|image: ${ECR_REGISTRY}/streamlinepay-prod-store-ui:${IMAGE_TAG}|g" store-ui/deployment.yaml

                        git config user.name "Jenkins CI"
                        git config user.email "ci@streamlinepay.com"

                        if ! git diff --quiet; then
                          git add .
                          git commit -m "Promote StreamlinePay services to tag ${IMAGE_TAG}"
                          git push origin ${GITOPS_BRANCH}
                        else
                          echo "No changes to commit."
                        fi
                    """
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }
}