#!/usr/bin/env node
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");


const API_ACCESS_KEY = process.env.YATIS_API_KEY ||  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiI2NTcyYTMyNzg3OWI5MTE0NmZkYWJmNzMiLCJpYXQiOjE3NDU4MzQ0Njk4ODEsImV4cCI6MTc0NTkyMDg2OTg4MX0.82151TRsZaA6B-mAZKpNJsLY_Oodv4Fi1L5MhdlwQsM";
const server = new Server(
  { name: "yatis-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Define the tools with the required inputSchema property
const TOOLS = [
  {
    name: "about",
    description: "Returns information about this MCP server",
    inputSchema: {  // This MUST be inputSchema, not parameters
      type: "object",
      properties: {},
      required: []
    }
  },

  {
    name: "where",
    description: "A tool that returns the current location of a given device",
    inputSchema: {  // This MUST be inputSchema, not parameters
      type: "object",
      properties: {
        deviceId: {
          type: "string",
          description: "ID of the device to locate"
        }
      },
      required: []
    }
  },
  {
    name: "batteryStatus",
    description: "A tool that returns the status of the battery of a given device. This includes location, battery level, other battery parameters and timestamp.",
    inputSchema: {  // This MUST be inputSchema, not parameters
      type: "object",
      properties: {
        deviceId: {
          type: "string",
          description: "ID of the device to locate"
        }
      },
      required: []
    }
  },
  {
    name: "getGroups",
    description: "A tool that returns the groups of a given access token",
    inputSchema: {  // This MUST be inputSchema, not parameters
      type: "object",
      properties: {
        api_access_token: {
          type: "string",
          description: "API access token"
        }
      },
      required: []
    }
  },
  {
    name: "getSummaryDataUsingVehicleDbId",
    description: "A tool that returns the summary data of a given vehicleDbId for a given start date and enddate. The summary data includes the distance travelled, the time taken and fuel consumed daily for the given date range.",
    inputSchema: {  // This MUST be inputSchema, not parameters
      type: "object",
      properties: {
        vehicleDbId: {
          type: "string",
          description: "ID of the vehicle to get summary data for"
        },
        startDate: {
          type: "string",
          description: "Start date in YYYY-MM-DD format"
        },
        endDate: {
          type: "string",
          description: "End date in YYYY-MM-DD format"
        }
      },
      required: []
    }
  },
  {
    name: "getDevicesVehiclesForGroup",
    description: "A tool that returns the devices and vehicles for a given group",
    inputSchema: {  // This MUST be inputSchema, not parameters
      type: "object",
      properties: {
        groupId: {
          type: "string",
          description: "ID of the group to get devices and vehicles for"
        }
      },
      required: []
    }
  },
  {
    name: "distanceWithHaversine",
    description: "Calculate the distance between 2 coordinates using the Haversine formula",
    inputSchema: {
      type: "object",
      properties: {
        lat1: {
          type: "number",
          description: "Latitude of the first point"
        },
        lon1: {
          type: "number",
          description: "Longitude of the first point"
        },
        lat2: {
          type: "number",
          description: "Latitude of the second point"
        },
        lon2: {
          type: "number",
          description: "Longitude of the second point"
        }
      },
      required: ["lat1", "lon1", "lat2", "lon2"]
    }
  },
];

// Handle all requests
server.fallbackRequestHandler = async (request) => {
  try {
    const { method, params, id } = request;
    console.error(`REQUEST: ${method} [${id}]`);
    
    // Initialize
    if (method === "initialize") {
      return {
        protocolVersion: "2025-04-30",
        capabilities: { tools: {} },
        serverInfo: { name: "yatis-mcp-server", version: "1.0.0" }
      };
    }
    
    // Tools list
    if (method === "tools/list") {
      console.error(`TOOLS: ${JSON.stringify(TOOLS)}`);
      return { tools: TOOLS };
    }
    
    // Tool call
    if (method === "tools/call") {
      const { name, arguments: args = {} } = params || {};
      
      if (name === "about") {
        return {
          content: [
            { 
              type: "text", 
              text: `This is a yatis MCP server (version 1.0.0).\n\nIt serves as a yatis for building Claude integrations.` 
            }
          ]
        };
      }
      
      if (name === "hello") {
        const userName = args.name || "World";
        return {
          content: [
            { 
              type: "text", 
              text: `Hello, ${userName}! This is a response from the yatis MCP server.` 
            }
          ]
        };
      }

      if (name === "where") {
        const deviceId = args.deviceId;
        if (!deviceId) {
          return {
            error: {
              code: -32602,
              message: "Missing required parameter: deviceId"
            }
          };
        }


        async function getVehicleLocation(deviceId) {
          // Simulate an asynchronous operation to get vehicle location
          // return new Promise((resolve) => {
          //   setTimeout(() => {
          //     resolve({ lat: 123.456, lon: 789.012 });
          //   }, 1000);
          // });

          //const URL= "https://api.yatis.io/api/currentLocation?deviceId=FM353201355697597&api_access_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiI1NjBhNzE3ZDM5OTRkNjA3N2RjZTMxMzYiLCJleHAiOjE0ODY5NzE2MDE3NzZ9.zzSk0-v9znX0URtLax-IEuebSeogISlsMGibDtd_y_M"
          const URL = `https://api.yatis.io/api/currentLocation?deviceId=${deviceId}&api_access_token=${API_ACCESS_KEY}`;
          console.error(`Fetching vehicle location from: ${URL}`);
          const response = await fetch(URL)
          const data = await response.json()
          console.error(`Response: ${JSON.stringify(data)}`);
          console.error(`Location: ${data.locationInfo.lat}, ${data.locationInfo.lon}`);

          return {
            lat: data.locationInfo.lat,
            lon: data.locationInfo.lon,
            timestamp: data.locationInfo.timestamp,
            speed: data.locationInfo.speed,
            addr: data.locationInfo.addr.short
          };

        }

        const location = await getVehicleLocation(deviceId);
        if (!location) {
          return {
            error: {
              code: -32602,
              message: `device with ID ${deviceId} not found`
            }
          };
        }
        
        return {
          content: [
            { 
              type: "text", 
              text: `The device with ID ${deviceId} is currently located at coordinates ${location.lat}, ${location.lon}. \nAddress: ${location.addr}. 
              It was last seen at ${location.timestamp} in GMT time with a speed of ${location.speed} km/h.` 
            }
          ]
        };

        
      }
      
      if (name === "getGroups") {
        async function get_groups(api_access_token) {
          const URL = `https://api.yatis.io/api/admin/getGroups?api_access_token=${api_access_token}`;
          console.error(`Fetching groups from: ${URL}`);
          const response = await fetch(URL);
          const data = await response.json();
          const group_array = []
          console.error(`Response: ${JSON.stringify(data)}`);
          data.groups.forEach(group => {
            group_array.push({
              type: "text",
              text: `Group ${group.groupName} has groupId ${group._id}`
            });
          }
          );      
          return group_array;


        }
          
      
          
      
      
        const group_array = await get_groups(API_ACCESS_KEY);
        console.error(`Groups: ${JSON.stringify(group_array)}`);
        return {
          content: group_array
        }

      }

      if (name === "getDevicesVehiclesForGroup") {
        const groupId = args.groupId;
        if (!groupId) {
          return {
            error: {
              code: -32602,
              message: "Missing required parameter: groupId"
            }
          };
        }

        async function getDevicesVehiclesForGroup(groupId) {
          const URL = `https://api.yatis.io/api/admin/getGroupDevices?groupId=${groupId}&api_access_token=${API_ACCESS_KEY}`;
          console.error(`Fetching devices and vehicles for group ${groupId} from: ${URL}`);
          const response = await fetch(URL);
          const data = await response.json();
          console.error(`Response: ${JSON.stringify(data)}`);
          const devices = data.devices;
          device_vehicles_array = []
          
          if (!devices || devices.length === 0) {
            return null;

          }
          else {
            devices.forEach(device => {
              if ('deviceId' in device && 'vehicleId' in device) {
                device_vehicles_array.push({
                  type: "text",
                  text: `Vehicle ${device.vehicleId} has deviceId ${device.deviceId} the vehicleDbId is ${device.vehicleDbId} and mobileNo ${device.mobileNo}`
                });
             }
            });
            console.error(`Devices: ${JSON.stringify(device_vehicles_array)}`);
            return device_vehicles_array;
          }
        }

        const devices = await getDevicesVehiclesForGroup(groupId);
        if (!devices) {
          return {
            error: {
              code: -32602,
              message: `Group with ID ${groupId} not found`
            }
          };
        }

        return {
          content: devices
        };
      }

      if (name === "batteryStatus") {
        const deviceId = args.deviceId;
        if (!deviceId) {
          return {
            error: {
              code: -32602,
              message: "Missing required parameter: deviceId"
            }
          };
        }
        async function getVehicleBatteryStatus(deviceId) {
          // Simulate an asynchronous operation to get vehicle location
          // return new Promise((resolve) => {
          //   setTimeout(() => {
          //     resolve({ lat: 123.456, lon: 789.012 });
          //   }, 1000);
          // });

          const URL = `https://api.yatis.io/api/getBatteryLevel?deviceId=${deviceId}&api_access_token=${API_ACCESS_KEY}`;
          console.error(`Fetching Battery Data from: ${URL}`);
          const response = await fetch(URL)
          const data = await response.json()
          console.error(`Response: ${JSON.stringify(data)}`);
          //console.error(`Location: ${data.locationInfo.lat}, ${data.locationInfo.lon}`);

          return {
            lat: data.batteryLevel.lat,
            lon: data.batteryLevel.lon,
            timestamp: data.batteryLevel.dts,
            soc: data.batteryLevel.bp,
            batteryVoltage: data.batteryLevel.ebv,
            addr: data.batteryLevel.addr
          };

        }

        const batteryStatus = await getVehicleBatteryStatus(deviceId);
        return {
          content: [
            {
              type: "text",
              text: `The device with ID ${deviceId} has a battery level or SoC of ${batteryStatus.soc}%. \nAddress: ${batteryStatus.addr}.
              It was last seen at ${batteryStatus.timestamp} in GMT time with a battery voltage of ${batteryStatus.batteryVoltage} V.`
            }
          ]
        };
      }

      if (name === "getSummaryDataUsingVehicleDbId") {
        const vehicleDbId = args.vehicleDbId;
        const startDate = args.startDate;
        const endDate = args.endDate;
        if (!vehicleDbId) {
          return {
            error: {
              code: -32602,
              message: "Missing required parameter: vehicleDbId"
            }
          };
        }
        if (!startDate) {
          return {
            error: {
              code: -32602,
              message: "Missing required parameter: startDate"
            }
          };
        }
        if (!endDate) {
          return {
            error: {
              code: -32602,
              message: "Missing required parameter: endDate"
            }
          };
        }

        async function getVehicleSummaryData(vehicleDbId, startDate, endDate) {
          // Simulate an asynchronous operation to get vehicle location
          // return new Promise((resolve) => {
          //   setTimeout(() => {
          //     resolve({ lat: 123.456, lon: 789.012 });
          //   }, 1000);
          // });

          const URL = `https://api.yatis.io/api/getSummarys?_vehicle=${vehicleDbId}&startTime=${startDate}&endTime=${endDate}&api_access_token=${API_ACCESS_KEY}`;
          console.error(`Fetching Summary Data from: ${URL}`);
          const response = await fetch(URL)
          const data = await response.json()
          //console.error(`Response: ${JSON.stringify(data)}`);
          //console.error(`Location: ${data.locationInfo.lat}, ${data.locationInfo.lon}`);
          
          const summarys = data.summarys;
          const summarys_array = []
          summarys.forEach(summary => {
            
            summarys_array.push({
              type: "text",
              text: `On day starting at ${summary.set} given in epoch time milliseconds the vehicle with ID ${vehicleDbId} has a distance travelled of ${summary.gps} kms 
              It has consumed a fuel of ${summary.cc} Kwh.`
            });
          });
            
          return summarys_array
          ;

          
        }

        const summaryData = await getVehicleSummaryData(vehicleDbId, startDate, endDate);
        return {
          content: summaryData
        };
      }

      if (name === "distanceWithHaversine") {
        const { lat1, lon1, lat2, lon2 } = args;
        if (!lat1 || !lon1 || !lat2 || !lon2) {
          return {
            error: {
              code: -32602,
              message: "Missing required parameters: lat1, lon1, lat2, lon2"
            }
          };
        }

        function haversine(lat1, lon1, lat2, lon2) {
          const toRadians = (degree) => (degree * Math.PI) / 180;
          const R = 6371; // Radius of the Earth in kilometers
          const dLat = toRadians(lat2 - lat1);
          const dLon = toRadians(lon2 - lon1);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) *
              Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c; // Distance in kilometers
        }

        const distance = haversine(lat1, lon1, lat2, lon2);
        return {
          content: [
            {
              type: "text",
              text: `The distance between the two points is ${distance.toFixed(2)} kilometers.`
            }
          ]
        };
      }

      return {
        error: {
          code: -32601,
          message: `Tool not found: ${name}`
        }
      };
    }
    
    // Required empty responses
    if (method === "resources/list") return { resources: [] };
    if (method === "prompts/list") return { prompts: [] };
    
    // Empty response for unhandled methods
    return {};
    
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    return {
      error: {
        code: -32603,
        message: "Internal error",
        data: { details: error.message }
      }
    };
  }
};

// Connect to stdio transport
const transport = new StdioServerTransport();

// Stay alive on SIGTERM
process.on("SIGTERM", () => {
  console.error("SIGTERM received but staying alive");
});

// Connect server
server.connect(transport)
  .then(() => console.error("Server connected"))
  .catch(error => {
    console.error(`Connection error: ${error.message}`);
    process.exit(1);
  });
