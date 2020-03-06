mkdir -p src-es2015/fpnn
mkdir -p src-es2015/rtm
babel src/fpnn/ErrorRecorder.js > src-es2015/fpnn/ErrorRecorder.js
babel src/fpnn/FPCallback.js > src-es2015/fpnn/FPCallback.js
babel src/fpnn/FPClient.js > src-es2015/fpnn/FPClient.js
babel src/fpnn/FPConfig.js > src-es2015/fpnn/FPConfig.js
babel src/fpnn/FPEncryptor.js > src-es2015/fpnn/FPEncryptor.js
babel src/fpnn/FPManager.js > src-es2015/fpnn/FPManager.js
babel src/fpnn/FPPackage.js > src-es2015/fpnn/FPPackage.js
babel src/fpnn/FPProcessor.js > src-es2015/fpnn/FPProcessor.js
babel src/fpnn/FPSocket.js > src-es2015/fpnn/FPSocket.js
babel src/rtm/RTMClient.js > src-es2015/rtm/RTMClient.js
babel src/rtm/RTMConfig.js > src-es2015/rtm/RTMConfig.js
babel src/rtm/RTMProcessor.js > src-es2015/rtm/RTMProcessor.js
