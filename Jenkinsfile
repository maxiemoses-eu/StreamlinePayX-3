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
        SERVICE_NAMES = "products user cart store-ui"
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
                        dir('products') {
                            sh 'npm install'
                        }
                    }
                }

                stage('user') {
                    steps {
                        dir('user') {
                            sh '''
                                python3 -m venv venv
                                venv/bin/pip install -r requirements.txt
                            '''
                        }
                    }
                }

                stage('cart') {
                    steps {
                        dir('cart') {
                            sh 'javac CartService.java'
                        }
                    }
                }

                stage('store-ui') {
                    steps {
                        dir('store-ui') {
                            // Static files, no build step required
                        }
                    }
                }
            }
        }

        stage('Docker Build & Scan') {
            steps {
                script {
                    for (service in SERVICE_NAMES.split(' ')) {
                        def dockerfile = "${service}/Dockerfile"
                        def imageName = "${service}:${IMAGE_TAG}"
                        
                        docker.build(imageName, "-f ${dockerfile} ${service}") 
                        sh "trivy image --exit-code 1 --severity HIGH,CRITICAL ${imageName}"
                    }
                }
            }
        }

        stage('Push to ECR') {
            steps {
                withAWS(credentials: "${AWS_CREDENTIAL_ID}", region: "${AWS_REGION}") {
                    sh """
                        aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

                        for service in ${SERVICE_NAMES}; do
                          LOCAL_TAG="\$service:${IMAGE_TAG}"
                          REMOTE_TAG="${ECR_REGISTRY}/\$service:${IMAGE_TAG}"
                          LATEST_TAG="${ECR_REGISTRY}/\$service:latest"

                          docker tag \${LOCAL_TAG} \${REMOTE_TAG}
                          docker tag \${LOCAL_TAG} \${LATEST_TAG}
                          
                          docker push \${REMOTE_TAG}
                          docker push \${LATEST_TAG}
                        done
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

                        for service in ${SERVICE_NAMES}; do
                          sed -i.bak "s|image: .*\\/\$service:.*|image: ${ECR_REGISTRY}/\$service:${IMAGE_TAG}|g" \${service}/deployment.yaml
                          rm \${service}/deployment.yaml.bak
                        done

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