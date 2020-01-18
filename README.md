# socket-simulator

Phase 1   
- Simulator will draw/follow a straight line co-ordinates       
- In code location latitude start from 13.5 and increases slighly. This app will send data to a socket listener app called iot-listener. iot-listener must be running for this program to successfully send data. Protocol followed - GT06N

Phase 2(TODO)  
- Load path details from file           

# Prerequisite    
1. node -v      
    v12.14.0    
    (v12.14+)   

    (install node using nvm only)   
    nvm install 12.14.0   
    nvm use 12.14.0   
    nvm alias default 12.14.0 (if needed)

2. pm2    
    (install pm2 globally)    
    npm i -g pm2

3. iot-listener (node app)    
    If iot listener is not running, listen from netcat(nc) in default/user-defined-port eg:- 9601. Open a terminal and type below command   
    nc -l -p 9601

# To run the app, execute in terminal(recommended way)
bin/run
