# Palmr.

Com a visão de simplificar a execução do projeto e permitir que ele seja executado em qualquer máquina, foi criado um script de inicialização para o docker compose.é necessário ter o docker e docker compose instalados para executar o projeto da maneira que vamos propor a seguir. Essa é a maneira mais simplificada de executar o projeto, porém não é a maneira recomendada para o modo de produção.

Temos duas maneiras de executar esse script, a primeira delas é executando o script via make file, e a segunda é executando o script diretamente.
Para executar via Make file, basta executar o comando abaixo:

make gen-compose

Esse comando irá gerar o arquivo docker-compose.yml na raiz do projeto. Ele tem a principal funcionalidade de gerar senhas seguras para nosso Minio e Postgres. que são nossos object storage e banco de dados respectivamente.

O compose gerado é uma base e pode ser modificado a qualquer momento por você. Vale lembrar que ele é escrito para executar em seu ambiente local via localhost e não para produção ou ambientes de VPS. Mas o mesmo após gerado pode ser modificado e/ou desmembrado para ser hospedado em qualquer lugar

A segunda maneira de executar o script é executando o comando abaixo:

chmod +x ./scripts/generate-docker-compose.sh
./scripts/generate-docker-compose.sh

esse conjunto de comandos surgem com o mesmo efeito do make gen-compose.

para executar o projeto após gerar o seu docker-compose.yaml basta executar o comando abaixo na raiz do projeto:

docker compose up -d

e para acessar o palmr, em ambnte local basta acessar http://localhost:4173

Para rodar em ambiente de produção, recomendamos utilizar Kubernetes, Docker Swarm ou algum orquestrador de containers similar. Para rodar localmente em sua máquina ou em algum ambiente de testes, você pode utilizar o Docker Compose com o arquivo docker-compose.yaml, que busca as imagens mais recentes do Palmr no Docker e as disponibiliza em algumas portas específicas, sendo elas:

* Frontend: http://localhost:4173
* Backend: http://localhost:3333
* MinIO API: http://localhost:9000
* MinIO Painel: http://localhost:9001
* Database Postgres: http://localhost:5423

Recomendamos que, nesta versão do docker-compose.yaml, nenhuma das portas de funcionamento do frontend e backend seja alterada. Consequentemente, nenhuma das URLs deve ser modificada, pois a imagem do frontend contém uma versão buildada configurada para funcionar na porta 4173, e, por motivos técnicos relacionados ao ReactJS, variáveis de ambiente que são executadas em runtime não podem ser alteradas. Por esse motivo, para garantir o bom funcionamento do sistema como foi planejado, mantenha o docker-compose.yaml inalterado.

Caso queira fazer alterações nas portas em ambiente local e executar o projeto via Docker com Docker Compose, recomendamos o uso do arquivo docker-compose-dev.yaml, que faz a build com base nos arquivos do repositório clonado. No entanto, certifique-se de fazer todas as configurações corretas de portas e URLs, pois, caso contrário, o Palmr não irá funcionar como planejado para ser executado.

Não recomendamos de maneira alguma o uso do docker-compose.yaml para ambientes produtivos ou em VPS, pois a tecnologia Docker Compose foi pensada para ambientes de desenvolvimento.
O que mais recomendamos para produção é o uso de Kubernetes, que deve ser configurado manualmente, pois o repositório não contém um modelo pronto para essa configuração. Outra maneira de colocar o software em ambiente produtivo é utilizando serviços separados, como, por exemplo:

* Hospedar o frontend na Vercel ou AWS Amplify.
* Hospedar o backend na Render.com ou serviços similares.
* Subir o MinIO separadamente em um servidor via Docker ou utilizar um serviço compatível com S3.
* Hospedar o banco de dados em um serviço como o Neon.tech.

O código é totalmente aberto, e você pode escolher a melhor maneira para fazer o deploy, mas atente-se às variáveis de ambiente (environment variables). A ideia de termos um docker-compose.yaml é apenas para facilitar o uso, a execução e os testes.


na pasta composes temos a versão que usa o código local ao invés de buscar nossas imagens no docker hub.

para executar essa versão, na raiz do projeto voce pode executar:

cp ./composes/docker-compose-local.yaml ./docker-compose.yaml

e executar docker compose up -d
