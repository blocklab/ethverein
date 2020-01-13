pipeline {
    agent any 

    stages {

        stage("Start docker services") {
            steps {
                sh "sudo docker-compose up -d --build"
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