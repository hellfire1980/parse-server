FROM node:latest

RUN mkdir parse

ADD . /parse
WORKDIR /parse
RUN npm install

ENV APP_ID setYourAppId
ENV MASTER_KEY setYourMasterKey
ENV DATABASE_URI setMongoDBURI
ENV serverURL setserverURL
ENV PARSE_PUBLIC_SERVER_URL setParsePublicServerUrl
ENV PARSE_SERVER_APP_NAME setPARSE_SERVER_APP_NAME
ENV PARSE_SERVER_VERIFY_USER_EMAILS setVerifyEmail
ENV MAILJET_API_KEY setMailApiKey
ENV MAILJET_API_SECRET setMailApiSecret
ENV MAILJET_ERROR_EMAIL setErrormail
ENV MAILJET_FROM_NAME setMailFromName
ENV MAILJET_FROM_EMAIL setMailFromEmail

# Optional (default : 'parse/cloud/main.js')
# ENV CLOUD_CODE_MAIN cloudCodePath

# Optional (default : '/parse')
# ENV PARSE_MOUNT mountPath

EXPOSE 1337

# Uncomment if you want to access cloud code outside of your container
# A main.js file must be present, if not Parse will not start

VOLUME /parse/cloud               

CMD [ "npm", "start" ]
