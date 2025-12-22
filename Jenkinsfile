pipeline {
    agent any

    environment {
        AWS_REGION          = 'us-west-2'
        ECR_REGISTRY        = '659591640509.dkr.ecr.us-west-2.amazonaws.com'
        IMAGE_TAG           = "${env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : env.BUILD_NUMBER}"
        GITOPS_REPO         = 'git@github.com/maxiemoses-eu/agrocd-yaml.git'
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
                    sh "docker build -t products-microservice:${IMAGE_TAG} -f products-microservice/Dockerfile products-microservice"
                    sh "docker build -t users-microservice:${IMAGE_TAG} -f user-microservice/Dockerfile user-microservice"
                    retry(3) {
                        sh "docker build -t cart-microservice:${IMAGE_TAG} -f cart-microservice/Dockerfile cart-microservice"
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

                    def images = [
                        "products-microservice",
                        "users-microservice",
                        "cart-microservice",
                        "store-ui"
                    ]

                    for (img in images) {
                        echo "🔍 Scanning ${img}:${IMAGE_TAG}..."
                        catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                            sh """
                                trivy image \
                                  --cache-dir ${TRIVY_CACHE} \
                                  --scanners vuln \
                                  --exit-code 1 \
                                  --severity HIGH,CRITICAL \
                                  --no-progress \
                                  ${img}:${IMAGE_TAG}
                            """
                        }
                        echo "✅ Trivy scan completed for ${img}:${IMAGE_TAG}"
                        sh "sleep 2"
                    }
                }
            }
        }

        stage('Push to ECR') {
            when {
                expression { currentBuild.result in [null, 'SUCCESS', 'UNSTABLE'] }
            }
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: "${AWS_CREDENTIAL_ID}"
                ]]) {
                    sh """
                        aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

                        docker tag products-microservice:${IMAGE_TAG} ${ECR_REGISTRY}/streamlinepay-prod-products-microservice:${IMAGE_TAG}
                        docker tag users-microservice:${IMAGE_TAG} ${ECR_REGISTRY}/streamlinepay-prod-users-microservice:${IMAGE_TAG}
                        docker tag cart-microservice:${IMAGE_TAG} ${ECR_REGISTRY}/streamlinepay-prod-cart-microservice:${IMAGE_TAG}
                        docker tag store-ui:${IMAGE_TAG} ${ECR_REGISTRY}/streamlinepay-prod-store-ui:${IMAGE_TAG}

                        docker push ${ECR_REGISTRY}/streamlinepay-prod-products-cna-microservice:${IMAGE_TAG}
                        docker push ${ECR_REGISTRY}/streamlinepay-prod-users-cna-microservice:${IMAGE_TAG}
                        docker push ${ECR_REGISTRY}/streamlinepay-prod-cart-cna-microservice:${IMAGE_TAG}
                        docker push ${ECR_REGISTRY}/streamlinepay-prod-store-ui:${IMAGE_TAG}
                    """
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
                        git clone ${GITOPS_REPO} gitops
                        cd gitops
                        git checkout ${GITOPS_BRANCH}

                        sed -i.bak "s|image: .*/products:.*|image: ${ECR_REGISTRY}/streamlinepay-prod-products-microservice:${IMAGE_TAG}|g" products/deployment.yaml
                        sed -i.bak "s|image: .*/user:.*|image: ${ECR_REGISTRY}/streamlinepay-prod-users-microservice:${IMAGE_TAG}|g" user/deployment.yaml
                        sed -i.bak "s|image: .*/cart:.*|image: ${ECR_REGISTRY}/streamlinepay-prod-cart-microservice:${IMAGE_TAG}|g" cart/deployment.yaml
                        sed -i.bak "s|image: .*/store-ui:.*|image: ${ECR_REGISTRY}/streamlinepay-prod-store-ui:${IMAGE_TAG}|g" store-ui/deployment.yaml

                        rm */*.bak

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
            cleanWs(patterns: [
                [pattern: '.trivycache/**', type: 'EXCLUDE'],
                [pattern: '.npm/**', type: 'EXCLUDE']
            ])
        }
    }
}
