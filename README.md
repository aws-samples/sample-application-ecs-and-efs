# Running containers with Amazon ECS and persisting data with EFS

In this demo we are going to build a book store sample application with a Node.js server which write and read data from a MongoDB. Both of them will use Amazon ECS as the platform to run their respectives containers. Besides, our Node.js application is stateless but we want persist data for our MongoDB.

# Prerequisites

- AWS Account
- AWS CLI installed and pre configured AWS Credentials
- [Docker](https://docs.docker.com/get-docker/)
- Pre configured VPC with minimum of 2 public subnets

**THIS DEMO WAS TESTED IN US-EAST-1 REGION**

# Testing locally

You can test our demo locally through localhost before to deploy in Amazon ECS. For that we also have a docker-compose file in our project, so you can test using the following command:

```bash
        docker-compose up
```

Then you can check if our application is responding through ***localhost/books***

And you can store new books if you use a POST request to localhost/books and provide the following body:

```bash
        {
                "title": "An awesome book",
                "description": "This book is awesome because..."
        }
```

Refresh your browser to see the new book stored.

# Setup instructions

Go to the AWS Console and then create an ECR Repository for our backend image that we are going to build.

Then build and push your backend image to ECR

```bash
        aws ecr get-login-password --region <REGION> | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com

        docker build -t <ECR_REPOSITORY_NAME> backend/.

        docker tag <ECR_REPOSITORY_NAME>:latest <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/<ECR_REPOSITORY_NAME>:latest

        docker push <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/<ECR_REPOSITORY_NAME>:latest
```

**Values to be replaced:**

**<ACCOUNT_ID>** - Your account ID number that the repository was created

**<REGION>** - The region that the repository was created

**<ECR_REPOSITORY_NAME>** - Repository name that was created through the AWS Console


### Use the CloudFormation template to create an ECS Cluster and a Backend Service

```bash
        aws cloudformation create-stack \
                --stack-name ecs-demo-cluster \
                --template-body file://cloudformation/ecs-stack.yaml \
                --parameters ParameterKey=ClusterName,ParameterValue=ecs-cluster-demo \
                ParameterKey=BackendServiceName,ParameterValue=backend-app \
                ParameterKey=BackendImageUrl,ParameterValue=<BACKEND_IMAGE_URL> \
                ParameterKey=VpcId,ParameterValue=<VPC_ID> \
                ParameterKey=VpcCidr,ParameterValue=<VPC_CIDR> \
                ParameterKey=PubSubnet1Id,ParameterValue=<PUB_SUBNET_1_ID> \
                ParameterKey=PubSubnet2Id,ParameterValue=<PUB_SUBNET_2_ID> \
                --capabilities CAPABILITY_IAM
```

**Values to be replaced:**

**<IMAGE_URL>** - The URI of our repository created for the backend image

**<VPC_ID>** - VPC that we will use to provision ECS cluster.

**<VPC_CIDR>** - VPC CIDR that we will use to provision ECS cluster.

**<PUB_SUBNET_1_ID>** - First public Subnet ID that we will use to provision ECS cluster.

**<PUB_SUBNET_2_ID>** - Second public Subnet ID that we will use to provision ECS cluster.

Wait for the solution be deployed through the CloudFormation template. When it has done, copy the output value for ALB DNS and paste in your browser and add /books at the end of the URI to see all the books stored.

# Clean Up

```bash
        aws cloudformation delete-stack \
                --stack-name ecs-demo-cluster
```
