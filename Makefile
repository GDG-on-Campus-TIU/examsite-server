include ./src/config/.env
export $(shell sed 's/=.*//' ./src/config/.env)

IMAGE_NAME=sof-exam
REPO_NAME=devpiush/$(IMAGE_NAME)
DOCKER_HOST=http://127.0.0.1

.PHONY: docker-build
docker-build:
	@echo "Building Docker image..."
	@sudo docker build -t $(IMAGE_NAME):latest .
	@sudo docker build -t $(IMAGE_NAME):$(GITHUB_SHA) .

.PHONY: docker-run
docker-run:
	@echo "Running Docker container..."
	@sudo docker run \
		-e PORT="$(PORT)" \
		-e MONGO_URL="$(MONGO_URL)" \
		-e JWT_SECRET="$(JWT_SECRET)" \
		-e HASH_KEY="$(HASH_KEY)" \
		-e ADMIN_USER="$(ADMIN_USER)" \
		-e ADMIN_PASSWORD="$(ADMIN_PASSWORD)" \
		--rm \
		-p "$(PORT):$(PORT)" \
		"$(IMAGE_NAME):latest"

.PHONY: docker-tag-push
docker-tag-push:
	@echo "Tagging and pushing Docker image..."
	@GITHUB_SHA=$$(git rev-parse --short HEAD) && \
	sudo docker tag $(IMAGE_NAME):latest $(REPO_NAME):latest && \
	sudo docker tag $(IMAGE_NAME):latest $(REPO_NAME):$(GITHUB_SHA) && \
	sudo docker push $(REPO_NAME):latest && \
	sudo docker push $(REPO_NAME):$(GITHUB_SHA)

.PHONY: docker-create-secret
docker-create-secret:
	@printf "$(MONGO_URL)" | DOCKER_HOST=${DOCKER_HOST} sudo docker secret create mongo-url -
	@printf "$(PORT)" | DOCKER_HOST=${DOCKER_HOST} sudo docker secret create port -
	@printf "$(JWT_SECRET)" | DOCKER_HOST=${DOCKER_HOST} sudo docker secret create jwt-secret -
	@printf "$(HASH_KEY)" | DOCKER_HOST=${DOCKER_HOST} sudo docker secret create hash-key -
	@printf "$(ADMIN_USER)" | DOCKER_HOST=${DOCKER_HOST} sudo docker secret create admin-user -
	@printf "$(ADMIN_PASSWORD)" | DOCKER_HOST=${DOCKER_HOST} sudo docker secret create admin-password -

.PHONY: docker-create-secret
docker-rm-secret:
	DOCKER_HOST=${DOCKER_HOST} sudo docker secret rm mongo-url
	DOCKER_HOST=${DOCKER_HOST} sudo docker secret rm port
	DOCKER_HOST=${DOCKER_HOST} sudo docker secret rm jwt-secret
	DOCKER_HOST=${DOCKER_HOST} sudo docker secret rm hash-key
	DOCKER_HOST=${DOCKER_HOST} sudo docker secret rm admin-user
	DOCKER_HOST=${DOCKER_HOST} sudo docker secret rm admin-password


.PHONY: deploy
deploy:
	@DOCKER_HOST=${DOCKER_HOST} sudo docker stack deploy -c docker-compose.yml sof-exam-server
