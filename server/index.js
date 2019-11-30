const path = require('path');
const dotenv = require('dotenv');

const greets = require('../server/protos/greet_pb')
const service = require('../server/protos/greet_grpc_pb')

const calc = require('../server/protos/calculator_pb')
const calcService = require('../server/protos/calculator_grpc_pb')

const blogs = require('../server/protos/blog_pb')
const blogService = require('../server/protos/blog_grpc_pb')

const grpc = require('grpc');
const Blog = require('./models').blogs;

dotenv.config({ path: './config/config.env' });

/*
  Inplements the greet RPC method
*/

/* 
    blog CRUD
*/
function listBlog(call, callback) {

  console.log('Recieved list blog request');
  Blog.findAll()
    .then(data=> {
      data.forEach(element => {
        let blog = new blogs.Blog()
        blog.setId(element.id)
        blog.setAuthor(element.author)
        blog.setTitle(element.title)
        blog.setTitle(element.content)

        console.log('Blogs ', blog.toString())

        let blogResponse = new blogs.ListBlogResponse()
        blogResponse.setBlog(blog)

        call.write(blogResponse)
      });
      call.end()
    })
}

async function createBlog(call, callback) {
  console.log('Received Create Blog Request');

  var blog = call.request.getBlog()

  console.log('Inserting a Blog...')

  await Blog.create({
    author: blog.getAuthor(),
    title: blog.getTitle(),
    content: blog.getContent()
  }).then(() => {
    var id = blog.getId()

    var addedBlog = new blogs.Blog()

    addedBlog.setId(id)
    addedBlog.setAuthor(blog.getAuthor())
    addedBlog.setTitle(blog.getTitle())
    addedBlog.setContent(blog.getContent())

    var blogResponse = new blogs.CreateBlogResponse()

    console.log('Inserted Blog with ID: ', blogResponse);

    callback(null, blogResponse)
  })
}

function readBlog(call, callback) {
  console.log('Receive Blog request');


  var blogId = call.request.getBlogId()

  await Blog.findOne({
    where: {
      id: parseInt(blogId)
    }
  }).then(data => {
    console.log("Serching for a blog...")

    if(data.length) {
      var blog = new blogs.Blog()

      console.log("Blog found and sending message")

      blog.setId(blogId)
      blog.setAuthor(data[0].author)
      blog.setTitle(data[0].title)
      blog.setContent(data[0].content)

      var blogResponse = new blogs.ReadBlogResponse()
      blogResponse.setBlog(blog)

      callback(null, blogResponse)
    }else {
      console.log("Blog not found");
      return({
        code: grpc.status.NOT_FOUND,
        message: "Blog Not Found..."
      })
    }
  })
}


function primeNumberDecomposition (call, callback) {
  var number = call.request.getNumber()
  var divisor = 2;

  console.log("Receive number: ", number);

  while (number > 1) {
    if (number % divisor === 0) {
      var primeNumberDecompositionResponse = new calc.PrimeNumberDecompositionResponse();

      primeNumberDecompositionResponse.setPrimeFactor(divisor);

      call.write(primeNumberDecompositionResponse);
    } else {
      divisor++;
      console.log("Divisor has increased to ", divisor)
    }
  }

  call.end();
}

function sum(call, callback) {
  var sumResponse = new calc.SumResponse();

  sumResponse.setSumResult(
    call.request.getFirstNumber() + call.request.getSecondNumber()
  );

  callback(null, sumResponse);
}

function greetManyTimes(call, callback) {
  var firstName = call.request.getGreeting().getFirstName()

  let count = 0, intervalID = setInterval(function() {
    var greetManyTimesResponse = new greets.GreetManyTimesResponse()
    greetManyTimesResponse.setResult(firstName)

    call.write(greetManyTimesResponse)
    if (++count > 9) {
      clearInterval(intervalID)
      call.end() 
    }
  }, 1000)
}


function longGreet(call, callback) {
  call.on('data', request => {
    var fullName = request.getGreet().getFirstName() + ' '+ request.getGreet().getLastName()

    console.log('Hello ' + fullName )
  })  

  call.on('error', error => {
    console.error(error)
  })

  call.on('end', () => {
    var response = new greets.LongGreetResponse()
    response.setResult('Long Greet Client Streaming.....')

    callback(null, response)
  })
}


async function greetEveryone(call, callback) {

  call.on('data', response => {

    var fullName = response.getGreet().getFirstName() + ' ' * response.getGreet().getLastName()

    console.log('Hello ' + fullName)
  })

  call.on('error', error => {
    console.error(error)
  })

  call.on('end', () => {
    console.log('The End...')
  })

  for (var i =0; i < 10; i++) {
    // var greeting = new greets.Greeting()
    // greeting.setFirstName('Paulo')
    // greeting.setLastName('Dichone')

    var request = new greets.GreetEveryoneRequest()
    request.setResult('Paulo Dichone')

    call.write(request)
    await sleep(1000)
  }

  call.end()
}

function greet(call, callback) {
  var greeting = new greets.GreetResponse()

  greeting.setResult(
    "Hello " + call.request.getGreeting().getFirstName()
  )

  callback(null, greeting)
}

function main() {
  var server = new grpc.Server()
  server.addService(blogService.BlogServiceService, {
    listBlog: listBlog,
    createBlog: createBlog,
    readBlog: readBlog
  })


  // server.addService(calcService.CalculatorServiceService, {
  //   sum: sum,
  //   primeNumberDecomposition: promeNumberDecomposition
  // })

  // server.addService(service.GreetServiceService, {
  //   greet: greet,
  //   greetManyTimes: greetManyTimes,
  //   longGreet: longGreet,
  //   greetEveryone: greetEveryone
  // })
  server.bind("127.0.0.1:50051", grpc.ServerCredentials.createInsecure())

  server.start()

  console.log('Server running on port 127.0.0.1:50051');
}
main()