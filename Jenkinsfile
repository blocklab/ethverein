pipeline {
    agent any 

    stages {

        stage("Start docker services") {
            steps {
                sh "sudo dockerd"
                sh "sudo chmod +x /usr/local/bin/docker-compose"
                sh "sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose"
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