var greets = require("../server/protos/greet_pb");
var service = require("../server/protos/greet_grpc_pb");
var calc = require("../server/protos/calculator_pb");
var calcService = require("../server/protos/calculator_grpc_pb");
var blogs = require("../server/protos/blog_pb");
var blogService = require("../server/protos/blog_grpc_pb");

var grpc = require('grpc');

function callListBlogs() {
  let client = new blogService.BlogServiceClient(
    "localhost:50051",
    grpc.credentials.createInsecure()
  )

  var emptyBlogRequest = new blogs.ListBlogRequest()
  var call = client.listBlog(emptyBlogRequest, () => {})

  call.on('data', response => {

    console.log('Client Streaming Response ', response.getBlog().toString())

  })

  call.on('error', error => {
    console.error(error);
  })

  call.on('end', () => {
    console.log('End');
  })
}

function callCreateBlog() {
  var client = new blogService.BlogServiceClient(
    "localhost:50051",
    grpc.credentials.createInsecure()
  )

  var blog = new blogs.Blog()
  blog.setAuthor("Tom York")
  blog.setTitle("First blog post")
  blog.setContent("This is great...")

  var blogRequest = new blogs.CreateBlogRequest()
  blogRequest.setBlog(blog)

  client.createBlog(blogRequest, (error, response) => {
    if(!error) {
      console.log('Receive create blog response,', response.toString())
    } else {
      console.error(error);
    }
  })
}

function callReadBlog() {
  var client = new blogService.BlogServiceClient(
    "localhost:50051",
    grpc.credentials.createInsecure()
  );

  var readBlogRequest = new calc.readBlogRequest();

}

function callSum() {
  var client = new calcService.CalculatorServiceClient(
    "localhost:50051",
    grpc.credentials.createInsecure()
  );

  var sumRequest = new calc.SumRequest();

  sumRequest.setFirstNumber(10);
  sumRequest.setSecondNumber(15);

  client.sum(sumRequest, (error, response) => {
    if (!error) {
      console.log(
        sumRequest.getFirstNumber() +
          " + " +
          sumRequest.getSecondNumber() +
          " = " +
          response.getSumResult()
      );
    } else {
      console.log(error)
    }
  })
}

function callPrimeNumberDecomposition() {
  var client = new calcService.CalculatorServiceClient(
    "localhost:50051",
    grpc.credentials.createInsecure()
  )

  var request = new calc.PrimeNumberDecompositionRequest()

  var number = 12

  request.setNumber(number)

  var call = client.primeNumberDecomposition(request, () => {})

  call.on('data', response => {
    console.log("Prime Factors Found: ", response.getPrimeFactor());
  })

  call.on('error', error => {
    console.error(error);
  })

  call.on('status', status => {
    console.log(status);
  })

  call.on('end', () => {
    console.log('Streaming Ended!');
  })
}

function callGreetings() {

  console.log('Hello From Client')
  callSum();

  var client = new service.GreetServiceClient(
    'localhost:50051',
    grpc.credentials.createInsecure()
  )

  let request = new greets.GreetRequest()

  let greeting = new greets.Greeting()
  greeting.setFirstName("Jerry")
  greeting.setLastName("Tom")

  request.setGreeting(greeting)

  client.greet(request, (error, response) => {

    if(!error) {
      console.log("Greeting Response: ", response.getResult())
    } else {
      console.log(error)
    }
  })
}

function callGreetManyTimes() {
  var client = new service.GreetServiceClient(
    'localhost:50051',
    grpc.credentials.createInsecure()
  )

  var request = new greets.GreetManyTimesRequest()

  var greeting = new greets.Greeting()
  greeting.setFirstName('Paulo')
  greeting.setLastName('Dichone')

  request.setGreeting(greeting)

  var call = client.greetManyTimes(request, () => {})

  call.on('data', (response) => {
    console.log('Client Streamning Response: ', response.getResult())
  })

  call.on('status', (status) => {
    console.log(status);
  })

  call.on('error', (error) => {
    console.error(error.details);

  })

  call.on('end', () => {
    console.log('Streaming Ended!')
  })
}

function callLongGreeting() {
  var client = new service.GreetServiceClient(
    "localhost:50051",
    grpc.credentials.createInsecure()
  );

  var request = new greets.LongGreetRequest()

  var call = client.longGreet(request, (error, response) => {
    if(!error) {
      console.log('Server Response: ', response.getResult())
    } else {
      console.log(error)
    }
  })

  let count = 0, intervalID = setInterval(function() {
    console.log('Sending message ' + count)

    var request = new greets.LongGreetRequest()
    var greeting = new greets.Greeting()
    greeting.setFirstName('Paulo')
    greeting.setLastName('Dichone')

    request.setGreet(greeting)

    var requestTwo = new greets.LongGreetRequest()
    var greetingTwo = new greets.Greeting()
    greetingTwo.setFirstName('Stephane')
    greetingTwo.setLastName('Maarek')

    requestTwo.setGreet(greetingTwo)

    call.write(request)
    call.write(requestTwo)

    if(++count > 3) {
      clearInterval(intervalID)
      call.end()
    }
  }, 1000)

}

async function sleep(interval) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), interval);
  });
}

async function callBiDirect() {
  console.log("hello I'm a gRPC Client");

  var client = new service.GreetServiceClient(
    "localhost:50051",
    grpc.credentials.createInsecure()
  );

  var call = client.greetEveryone(request, (error, response) => {
    console.log("Server Response: " + response);
  });

  call.on("data", response => {
    console.log("Hello Client!" + response.getResult());
  });

  call.on("error", error => {
    console.error(error);
  });

  call.on("end", () => {
    console.log("Client The End");
  });

  for (var i = 0; i < 10; i++) {
    var greeting = new greets.Greeting();
    greeting.setFirstName("Stephane");
    greeting.setLastName("Maarek");

    var request = new greets.GreetEveryoneRequest();
    request.setGreet(greeting);

    call.write(request);

    await sleep(1500);
  }

  call.end();
}

function main () {
  callCreateBlog()
  //callListBlogs()
  // callBiDirect()
  //callLongGreeting()
  //callPrimeNumberDecomposition()
  //callGreetManyTimes()
  // callGreetings()
  //callSum()
}
main()