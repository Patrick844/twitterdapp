// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

contract TwitterContract{
    /*
    ***  Structure Region ***    
    */ 
    // Define structure of the tweet
    struct Tweet{
        uint tweetID;
        address owner;
        string tweetText;
        bool isDeleted;
    }

    /*
    ***  Events Region ***    
    */ 
    // CreateTweet Event
    event CreateTweet(uint tweetID,address owner,string tweetText,bool isDeleted);

    // UpdateTweet Event 
    event UpdateTweet(uint tweetID,address owner,string tweetText,bool isDeleted);

    // DeleteTweet Event
    event DeleteTweet(uint tweetID,bool isDeleted);

    /*
    ***  Variables Region ***    
    */ 
    // tweets list
    mapping(uint => Tweet) public tweets;

    // This array store the tweets'id by creating record order
    uint[] private tweetsPool;

    // Store temporal the new generated Id
    uint private tempNewId;

    // Mapping of TweetID to the address of the user
    mapping(uint256 => address) tweetToOwner;

    /*
    ***  Functions Region ***    
    */ 
    //
    function random() private view returns(uint){
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, msg.sender)));
    }

    //
    function GetNewId() public view returns(uint){
        return tempNewId;
    }

    // create a new tweet 
    function createTweet(string memory tweetText, bool isDeleted) public {
        uint _tweetID = random();
        tempNewId = _tweetID;
        tweets[_tweetID] = Tweet(_tweetID, msg.sender, tweetText, isDeleted);
        tweetsPool.push(_tweetID);
        tweetToOwner[_tweetID] = msg.sender;
        emit CreateTweet(_tweetID, msg.sender, tweetText, false);       
    }

    // Update a Tweet
    function updateTweet(uint _tweetID, string memory _tweetText) public {
        require(
            tweetToOwner[_tweetID] == msg.sender,
            "You are not tweet owner"
        );
        tweets[_tweetID].tweetText = _tweetText;
        emit UpdateTweet(_tweetID, msg.sender, _tweetText, false);      
    }

    // Deleted a Tweet
        function deleteTweet(uint tweetId, bool isDeleted) external {
        if(tweetToOwner[tweetId] == msg.sender) {
            tweets[tweetId].isDeleted = isDeleted;
            emit DeleteTweet(tweetId, isDeleted);
        }
    }

    // Get all the tweets
    function getAllAvailableTweets() public view returns (Tweet[] memory){
        Tweet[] memory temporary = new Tweet[](tweetsPool.length);
        uint counter = 0;
        for(uint i=0; i<tweetsPool.length; i++) {
            if(tweets[i].isDeleted == false) {
                temporary[counter] = tweets[i];
                counter++;
            }
        }

        Tweet[] memory result = new Tweet[](counter);
        for(uint i=0; i<counter; i++) {
            result[i] = temporary[i];
        }
        return result;
    }




    // Get only my tweets
    function getMyAvailableTweets() public view returns (Tweet[] memory){
        Tweet[] memory temp = new Tweet[](tweetsPool.length);
        uint counter = 0;
        for(uint i=0; i<tweetsPool.length; i++){
            if(tweetToOwner[tweetsPool[i]] == msg.sender && !tweets[tweetsPool[i]].isDeleted){
                temp[counter] = tweets[tweetsPool[i]];
                counter++;
            }
        }
        Tweet[] memory result = new Tweet[](counter);
        for(uint i=0; i<counter; i++){
            result[i] = temp[i];
        }
        return result;
    }
}
