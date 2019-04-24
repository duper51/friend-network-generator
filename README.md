# Friend Network Generator

Friend network generator is a pretty frontend to a NodeJS Twitter Crawler.
The ultimate goal of this software is to build a network of relationships
between a starting user and its followers.

## Installation

Since this is a graphical application, you will need a graphical environment to run this software. The solution is 
based on the electron framework and requires an environment that will support the electron framework. You will also need
a recent NodeJS installation.

Once the prerequisites are installed, clone this repository. Then run `npm install`. This will initialize the needed
dependencies.

## Running

To run the software, simply run `npm start` in the root of the project. This will open the electron window.

In order to use the software, you will need a Twitter API keyset. You can apply for a developer key on 
[the twitter developer site](https://developer.twitter.com/en/). Then, fill the form on the first screen of the
application and click start.

The script will begin crawling Twitter from the given starting username. The status page will update every time the 
script executes a crawlstep. To export the data as an edgelist, click the write CSV button.


### Output

The output of the Write CSV function is a CSV containing the starting node
and the ending node of an edge.