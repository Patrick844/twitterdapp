const { expect } = require("chai");
const { ethers } = require("hardhat");
require("chai").should();

describe("TwitterContract", function(){
    let Twitter;
    let twitter;
    let user1;
    let user2;

    beforeEach(async function() {
      Twitter = await ethers.getContractFactory("TwitterContract");
      [user1, user2] = await ethers.getSigners();
      twitter  = await Twitter.deploy();

  });

  // Test for create tweet
  it("Create a tweet", async function() {
      await twitter.connect(user1).createTweet("Hello World");
      const tid = await twitter.connect(user1).GetNewId();
      const tweets = await twitter.getAllAvailableTweets();

      expect(tweets.length).to.equal(1);
      expect(tweets[0].tweetID).to.equal(tid);
      expect(tweets[0].tweetText).to.equal("Hello World");
  });


  // Create tweet should emit event
  it("should emit createTweet event", async function(){
      await expect(twitter.connect(user1).createTweet("Hello World")).to.emit(twitter, "CreateTweet");
  });

  // Test error of creating tweet
  it("should not be able to create tweet", async function(){
      await twitter.connect(user1).createTweet("error", "also", 32).should.be.reverted;
  });

  // Test update tweet
  it("should update a tweet", async function(){
      await twitter.connect(user1).createTweet("Hello World");
      const tid = await twitter.connect(user1).GetNewId();
      await twitter.connect(user1).updateTweet(tid, "Hello Everyone");

      const tweets = await twitter.getAllAvailableTweets();
      expect(tweets.length).to.equal(1);
      expect(tweets[0].tweetID).to.equal(tid);
      expect(tweets[0].tweetText).to.equal("Hello Everyone");
  });

  // Test multiple updates
  it("should update a tweet among multiple records", async function(){
      await twitter.connect(user1).createTweet("Hello World");
      const tid = await twitter.connect(user1).GetNewId();
      await twitter.connect(user1).createTweet("Hello Everyone");
      const tid2 = await twitter.connect(user1).GetNewId();
      await twitter.connect(user1).updateTweet(tid2, "How are you");

      const tweets = await twitter.getAllAvailableTweets();

      expect(tweets.length).to.equal(2);
      expect(tweets[0].tweetText).to.equal("Hello World");
      expect(tweets[0].tweetID).to.equal(tid);
      expect(tweets[1].tweetText).to.equal("How are you");
      expect(tweets[1].tweetID).to.equal(tid2);
  });

  // Should not be able to update another user tweet
  it("should not be able to update other user tweet", async function() {
      await twitter.connect(user1).createTweet("Hello World");
      const tid = await twitter.connect(user1).GetNewId();
      await twitter.connect(user2).createTweet("Hello Everyone");  
      const tid2 = await twitter.connect(user2).GetNewId(); 
      
      const mytweets = await twitter.connect(user1).getMyAvailableTweets();
      expect(mytweets.length).to.equal(1);
      expect(mytweets[0].tweetText).to.equal("Hello World");
      expect(mytweets[0].tweetID).to.equal(tid);

      const mytweets2 = await twitter.connect(user2).getMyAvailableTweets();
      expect(mytweets2.length).to.equal(1);
      expect(mytweets2[0].tweetText).to.equal("Hello Everyone");
      expect(mytweets2[0].tweetID).to.equal(tid2);
      
      await twitter.connect(user1).updateTweet(tid2, "Bonjour").should.be.reverted;
      await twitter.connect(user2).updateTweet(tid, "Bonjour").should.be.reverted;      
  });

  // Update tweet should emit event
  it("update a tweet should emit event", async function() {
      await twitter.connect(user1).createTweet("Hello World");
      const tid = await twitter.connect(user1).GetNewId();
      await expect(twitter.connect(user1).updateTweet(tid,"Hello Everyone")).to.emit(twitter, "UpdateTweet");
  });


  // Delete a tweet with an exsiting tweetId
  it("should delete a tweet", async function(){
      await twitter.connect(user1).createTweet("Hello World");
      const tid = await twitter.connect(user1).GetNewId();
      await twitter.connect(user1).createTweet("Hello Everyone");
      const tid2 = await twitter.connect(user1).GetNewId();
      await twitter.connect(user1).deleteTweet(tid2);

      const tweets = await twitter.getAllAvailableTweets()    
      expect(tweets.length).to.equal(1);
      expect(tweets[0].isDeleted).to.equal(false);
      expect(tweets[0].tweetText).to.equal("Hello World");
      expect(tweets[0].tweetID).to.equal(tid);
  });

  // Should not be able to delete another user tweet
  it("should not delete another user's tweet", async function() {
      await twitter.connect(user1).createTweet("Hello World");
      const tid = await twitter.connect(user1).GetNewId();
      await twitter.connect(user2).createTweet("Hello Everyone");
      const tid2 = await twitter.connect(user2).GetNewId();
      await twitter.connect(user1).deleteTweet(tid2).should.be.reverted;
  });

  // Delete tweet should emit event
  it("Delete a tweet should emit event", async function() {
      await twitter.connect(user1).createTweet("Hello World");
      const tid = await twitter.connect(user1).GetNewId();
      await expect(twitter.connect(user1).deleteTweet(tid)).to.emit(twitter, "DeleteTweet");
  });

})

    

    
