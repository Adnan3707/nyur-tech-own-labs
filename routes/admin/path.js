"use strict";
const Paths = require("../../models/paths");
const SubPaths = require("../../models/sub_paths");
const audit_trail = require("../../models/audit_trial");
const {
  SERVER_ERROR,
  PATH_DUPLICATE,
  PATH_NOT_FOUND,
  SUCCESS,
} = require("../../config/errors.json");
const validator = require('../../Validators/validators')


module.exports = async function (fastify, opts) {
  fastify.post(
    "/newPath",
    {
      preValidation: [fastify.rootauthorize],
    },
    async function (request, reply) {
      let language = request.headers["accept-language"]
        ? request.headers["accept-language"]
        : "en";

      let resp,
        logs = {
          email: request.body.email ? request.body.email : "NA",
          action: "newPath",
          url: "/newPath",
          request_header: JSON.stringify(request.headers),
          request: JSON.stringify(request.body),
          axios_request: "",
          axios_response: "",
        };

      try {
        let qs = await Paths.create(request.body);

        //SENDING BACK RESPONSE
        reply.code(200);
        resp = {
          statusCode: 200,
          message: SUCCESS[language],
          data: qs,
        };
        logs.response = JSON.stringify(resp);
        logs.status = "SUCCESS";
        await audit_trail.create(logs);
        return resp;
      } catch (err) {
        console.error(err);
        if (err.name === "MongoServerError" && err.code === 11000) {
          // CATCH DUPLICATE PATHNAME ERROR
          resp = {
            statusCode: 400,
            message: PATH_DUPLICATE[language],
          };
          logs.response = JSON.stringify(resp);
          logs.status = "FAILURE";
          await audit_trail.create(logs);
          reply.code(400);
          return resp;
        }

        resp = {
          statusCode: 400,
          message: SERVER_ERROR[language],
        };
        logs.response = JSON.stringify(resp);
        logs.status = "FAILURE";
        await audit_trail.create(logs);
        reply.code(400);
        return resp;
      }
    }
  );

  fastify.post(
    "/newSubPath",
    {
      preValidation: [fastify.rootauthorize],
    },
    async function (request, reply) {
      let language = request.headers["accept-language"]
        ? request.headers["accept-language"]
        : "en";

      let resp,
        logs = {
          email: request.body.email ? request.body.email : "NA",
          action: "newSubPath",
          url: "/newSubPath",
          request_header: JSON.stringify(request.headers),
          request: JSON.stringify(request.body),
          axios_request: "",
          axios_response: "",
        };
      let data = request.body;

      try {
        // GETTING PRIMARY PATH ID
        let primary_path = await Paths.findById(request.body.primary_path_id);

        //GETTING LAST UPDATED VERSION OF THE PATH
        let sub_path = await SubPaths.findOne({
          primary_path_id: request.body.primary_path_id,
        }).sort({
          sub_path_no: -1,
        });

        if (sub_path) {
          data.sub_path_no = parseFloat(
            parseFloat(sub_path.sub_path_no) + 0.1
          ).toFixed(1);
        } else {
          data.sub_path_no = "1.0";
        }

        // IF PATH DOES NOT EXIST
        if (primary_path == null) {
          resp = {
            statusCode: 400,
            message: PATH_NOT_FOUND[language],
          };
          logs.response = JSON.stringify(resp);
          logs.status = "FAILURE";
          await audit_trail.create(logs);
          reply.code(400);
          return resp;
        }
        // PATH ID CHECK ENDS

        data.primary_path_name = primary_path.path_name;
        let qs = await SubPaths.create(data);

        //SENDING BACK RESPONSE
        reply.code(200);
        resp = {
          statusCode: 200,
          message: SUCCESS[language],
          data: qs,
        };
        logs.response = JSON.stringify(resp);
        logs.status = "SUCCESS";
        await audit_trail.create(logs);
        return resp;
      } catch (err) {
        console.error(err);
        if (err.name === "MongoServerError" && err.code === 11000) {
          // CATCH DUPLICATE PATHNAME ERROR
          resp = {
            statusCode: 400,
            message: PATH_DUPLICATE[language],
          };
          logs.response = JSON.stringify(resp);
          logs.status = "FAILURE";
          await audit_trail.create(logs);
          reply.code(400);
          return resp;
        }

        resp = {
          statusCode: 400,
          message: SERVER_ERROR[language],
        };
        logs.response = JSON.stringify(resp);
        logs.status = "FAILURE";
        await audit_trail.create(logs);
        reply.code(400);
        return resp;
      }
    }
  );
  fastify.patch(
    "/updateContent",
    {
      preValidation: [fastify.rootauthorize],
    },async function (request, reply) {
      let language = request.headers["accept-language"]
        ? request.headers["accept-language"]
        : "en";

      let resp,
        logs = {
          email: request.body.email ? request.body.email : "NA",
          action: "updateContent",
          url: "/updateContent",
          request_header: JSON.stringify(request.headers),
          request: JSON.stringify(request.body),
          axios_request: "",
          axios_response: "",
        };
      let data = request.body;
      //Check if sub path will cointain at least one word
      const wordRegex = /\w+/;
      try{
     // Check Parrent Path Name Exists
        if ( !Object.hasOwnProperty.bind(data)('category_content') ){
          resp = {
            statusCode: 400,
            message: 'Provide category_content in body',
          };
          logs.response = JSON.stringify(resp);
          logs.status = "FAILURE";
          await audit_trail.create(logs);
          reply.code(400);
          return resp;
        }

        //Find Sub Path
        let sub_path = await SubPaths.findOne({
          primary_path_name: data.category_content
        })
         // Check :- New path name At least one Word 
         if(! wordRegex.test(data['sub_path_name'])){
          resp = {
            statusCode: 400,
            message: 'Provide Sub Path Name',
          };
          logs.response = JSON.stringify(resp);
          logs.status = "FAILURE";
          await audit_trail.create(logs);
          reply.code(400);
          return resp;
        }
         // Add Different Name
        if (sub_path['sub_path_name'] != data['sub_path_name']) {
          sub_path['sub_path_name'] = data['sub_path_name']
        }

        // Check if Question Schema is Right
        let qSchema = validator.hasSameSchema(data.questions)
        if(!qSchema){
          resp = {
            statusCode: 400,
            message: 'Wrong questions Schma',
          };
          logs.response = JSON.stringify(resp);
          logs.status = "FAILURE";
          await audit_trail.create(logs);
          reply.code(400);
          return resp;
        }

        // Match  Questions , Update Questions  
     data.questions.forEach(updatedQuestion => {
      const foundQuestion = sub_path.questions.find(question => question.question_no == updatedQuestion.question_no);
      if (foundQuestion) {
        foundQuestion.question = updatedQuestion.question;
      } else {
        sub_path.questions.push(updatedQuestion);
      }
        });
    // console.log(sub_path)

    // If Everything Is Correct
    await sub_path.save()
    // Send Response
      resp = {
        statusCode: 200,
        message: 'data updated to Mongodb',
        data: sub_path
      };
      logs.response = JSON.stringify(resp);
      logs.status = "SUCCESS";
      await audit_trail.create(logs);
      reply.code(200);

      return resp

      } catch (err) {
        console.error(err);
        if (err.name === "MongoServerError" && err.code === 11000) {
          // CATCH DUPLICATE PATHNAME ERROR
          resp = {
            statusCode: 400,
            message: PATH_DUPLICATE[language],
          };
          logs.response = JSON.stringify(resp);
          logs.status = "FAILURE";
          await audit_trail.create(logs);
          reply.code(400);
          return resp;
        }

        resp = {
          statusCode: 400,
          message: PATH_NOT_FOUND[language],
        };
        logs.response = JSON.stringify(resp);
        logs.status = "FAILURE";
        await audit_trail.create(logs);
        reply.code(400);
        return resp;
      }

    }
  )
  fastify.post('/pathDetails', {
    preValidation: [fastify.rootauthorize],
  },async function (request,reply){
    let language = request.headers["accept-language"]
    ? request.headers["accept-language"]
    : "en";

  let resp,
    logs = {
      email: request.body.email ? request.body.email : "NA",
      action: "pathDetails",
      url: "/pathDetails",
      request_header: JSON.stringify(request.headers),
      request: JSON.stringify(request.body),
      axios_request: "",
      axios_response: "",
    };
    try{

      // Retreieve Path Path Name & if 
    let path = await Paths.find({}, { _id: 1,path_name: 1 })
    // Send Response
    return path
    } catch (err) {
      console.error(err);
      if (err.name === "MongoServerError" && err.code === 11000) {
        // CATCH DUPLICATE PATHNAME ERROR
        resp = {
          statusCode: 400,
          message: PATH_DUPLICATE[language],
        };
        logs.response = JSON.stringify(resp);
        logs.status = "FAILURE";
        await audit_trail.create(logs);
        reply.code(400);
        return resp;
      }

      resp = {
        statusCode: 400,
        message: SERVER_ERROR[language],
      };
      logs.response = JSON.stringify(resp);
      logs.status = "FAILURE";
      await audit_trail.create(logs);
      reply.code(400);
      return resp;
    }
})}
