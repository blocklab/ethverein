pipeline {
    agent any 

    stages {
        stage("Clone Project") {
            steps {
                sh "git clone https://github.com/blocklab/ethverein.git"
                sh "cd /ethverein"
            }
        }

        stage("Compose up") {
            steps {
                sh "docker-compose up -d --build"
            }
        }

        stage("Run tests") {
            steps {
                sh "docker exec -ti ethverein /bin/bash"
                sh "cd src/"
                sh "truffle test"
            }

        }
    }
}