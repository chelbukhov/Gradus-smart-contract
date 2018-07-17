pragma solidity ^0.4.24;


/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
    // Gas optimization: this is cheaper than asserting 'a' not being zero, but the
    // benefit is lost if 'b' is also tested.
    // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
    if (a == 0) {
      return 0;
    }

    c = a * b;
    assert(c / a == b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    // uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return a / b;
  }

  /**
  * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
    c = a + b;
    assert(c >= a);
    return c;
  }
}

contract ERC20Basic {
  function totalSupply() public view returns (uint256);
  function balanceOf(address who) public view returns (uint256);
  function transfer(address to, uint256 value) public returns (bool);
  event Transfer(address indexed from, address indexed to, uint256 value);
}

contract ERC20 is ERC20Basic {
  function allowance(address owner, address spender)
    public view returns (uint256);

  function transferFrom(address from, address to, uint256 value)
    public returns (bool);

  function approve(address spender, uint256 value) public returns (bool);
  event Approval(
    address indexed owner,
    address indexed spender,
    uint256 value
  );
}

contract BasicToken is ERC20Basic {
  using SafeMath for uint256;

  mapping(address => uint256) balances;

  uint256 totalSupply_;

  /**
  * @dev Total number of tokens in existence
  */
  function totalSupply() public view returns (uint256) {
    return totalSupply_;
  }

  /**
  * @dev Transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint256 _value) public returns (bool) {
    require(_to != address(0));
    require(_value <= balances[msg.sender]);

    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
    emit Transfer(msg.sender, _to, _value);
    return true;
  }

  /**
  * @dev Gets the balance of the specified address.
  * @param _owner The address to query the the balance of.
  * @return An uint256 representing the amount owned by the passed address.
  */
  function balanceOf(address _owner) public view returns (uint256) {
    return balances[_owner];
  }

}


contract StandardToken is ERC20, BasicToken {

  mapping (address => mapping (address => uint256)) internal allowed;


  /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint256 the amount of tokens to be transferred
   */
  function transferFrom(
    address _from,
    address _to,
    uint256 _value
  )
    public
    returns (bool)
  {
    require(_to != address(0));
    require(_value <= balances[_from]);
    require(_value <= allowed[_from][msg.sender]);

    balances[_from] = balances[_from].sub(_value);
    balances[_to] = balances[_to].add(_value);
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    emit Transfer(_from, _to, _value);
    return true;
  }

  /**
   * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
   * Beware that changing an allowance with this method brings the risk that someone may use both the old
   * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
   * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
   * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
   * @param _spender The address which will spend the funds.
   * @param _value The amount of tokens to be spent.
   */
  function approve(address _spender, uint256 _value) public returns (bool) {
    allowed[msg.sender][_spender] = _value;
    emit Approval(msg.sender, _spender, _value);
    return true;
  }

  /**
   * @dev Function to check the amount of tokens that an owner allowed to a spender.
   * @param _owner address The address which owns the funds.
   * @param _spender address The address which will spend the funds.
   * @return A uint256 specifying the amount of tokens still available for the spender.
   */
  function allowance(
    address _owner,
    address _spender
   )
    public
    view
    returns (uint256)
  {
    return allowed[_owner][_spender];
  }

  /**
   * @dev Increase the amount of tokens that an owner allowed to a spender.
   * approve should be called when allowed[_spender] == 0. To increment
   * allowed value is better to use this function to avoid 2 calls (and wait until
   * the first transaction is mined)
   * From MonolithDAO Token.sol
   * @param _spender The address which will spend the funds.
   * @param _addedValue The amount of tokens to increase the allowance by.
   */
  function increaseApproval(
    address _spender,
    uint256 _addedValue
  )
    public
    returns (bool)
  {
    allowed[msg.sender][_spender] = (
      allowed[msg.sender][_spender].add(_addedValue));
    emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
    return true;
  }

  /**
   * @dev Decrease the amount of tokens that an owner allowed to a spender.
   * approve should be called when allowed[_spender] == 0. To decrement
   * allowed value is better to use this function to avoid 2 calls (and wait until
   * the first transaction is mined)
   * From MonolithDAO Token.sol
   * @param _spender The address which will spend the funds.
   * @param _subtractedValue The amount of tokens to decrease the allowance by.
   */
  function decreaseApproval(
    address _spender,
    uint256 _subtractedValue
  )
    public
    returns (bool)
  {
    uint256 oldValue = allowed[msg.sender][_spender];
    if (_subtractedValue > oldValue) {
      allowed[msg.sender][_spender] = 0;
    } else {
      allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
    }
    emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
    return true;
  }

}

contract GRADtoken is StandardToken {
    string public constant name = "Gradus";
    string public constant symbol = "GRAD";
    uint32 public constant decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => bool   ) isInvestor;
    address[] public arrInvestors;
    
    address public CrowdsaleAddress;
    bool public lockTransfers = false;

    event Mint (address indexed to, uint256  amount);
    event Burn(address indexed burner, uint256 value);
    
    constructor(address _CrowdsaleAddress) public {
        CrowdsaleAddress = _CrowdsaleAddress;
    }
  
    modifier onlyOwner() {
        /**
         * only Crowdsale contract can run it
         */
        require(msg.sender == CrowdsaleAddress);
        _;
    }   

    function addInvestor(address _newInvestor) internal {
        if (!isInvestor[_newInvestor]){
            isInvestor[_newInvestor] = true;
            arrInvestors.push(_newInvestor);
        }  
    }

    function getInvestorAddress(uint256 _num) public view returns(address) {
        return arrInvestors[_num];
    }

    function getInvestorsCount() public view returns(uint256) {
        return arrInvestors.length;
    }

     // Override
    function transfer(address _to, uint256 _value) public returns(bool){
        if (msg.sender != CrowdsaleAddress){
            require(!lockTransfers, "Transfers are prohibited");
        }
        addInvestor(_to);
        return super.transfer(_to,_value);
    }

     // Override
    function transferFrom(address _from, address _to, uint256 _value) public returns(bool){
        if (msg.sender != CrowdsaleAddress){
            require(!lockTransfers, "Transfers are prohibited");
        }
        addInvestor(_to);
        return super.transferFrom(_from,_to,_value);
    }
     
    function mint(address _to, uint256 _value) public onlyOwner returns (bool){
        balances[_to] = balances[_to].add(_value);
        totalSupply = totalSupply.add(_value);
        addInvestor(_to);
        emit Mint(_to, _value);
        return true;
    }
    
    function burn(address _who, uint256 _value) public onlyOwner {
        require(_value <= balances[_who]);
        balances[_who] = balances[_who].sub(_value);
        totalSupply_ = totalSupply_.sub(_value);
        emit Burn(_who, _value);
        emit Transfer(_who, address(0), _value);
    }
    
    function lockTransfer(bool _lock) public onlyOwner {
        lockTransfers = _lock;
    }

    function() external payable {
        // The token contract don`t receive ether
        revert();
    }  
}

contract Ownable {
    address public owner;
    address candidate;

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }


    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        candidate = newOwner;
    }

    function confirmOwnership() public {
        require(candidate == msg.sender);
        owner = candidate;
        delete candidate;
    }

}

contract Dividend {
    /**
     * @title Contract receive ether, calculate profit and distributed it to investors
     */
    using SafeMath for uint256;

    uint256 public receivedDividends;
    address public crowdsaleAddress;
    GRADtoken public token;
    mapping (address => uint256) divmap;
    event PayDividends(address indexed investor, uint256 amount);

    constructor(address _crowdsaleAddress, address _tokenAddress) public {
        crowdsaleAddress = _crowdsaleAddress;
        token = GRADtoken(_tokenAddress);
    }
    
    CrowdSale crowdSaleContract = CrowdSale(crowdsaleAddress);
    
    /** 
     * @dev function calculate dividends and store result in mapping divmap
     * @dev stop all transfer before calculations
     * k - coefficient.mul(1000000)
     */    
    function _CalcDiv() internal {
        crowdSaleContract.lockTransfer(true); 
        uint256 i;
        uint256 k;
        address invAddress;
        uint256 lengthArrInvesotrs = token.getInvestorsCount();
        k = address(this).balance.mul(1000000).div(token.totalSupply());
        uint256 myProfit;
        
        for (i = 0;  i < lengthArrInvesotrs; i++) {
            invAddress = token.getInvestorAddress(i);
            myProfit = token.balanceOf(invAddress).mul(k).div(1000000);
            divmap[invAddress] = divmap[invAddress].add(myProfit);
        }
        crowdSaleContract.lockTransfer(false); 
    }

    /**
     * function show dividends 
     */
    function showDividends() public view returns(uint256) {
        return divmap[msg.sender];
    }
    
    /**
     * function pay dividends to investors
     */
    function Pay() public payable {
        uint256 dividends = divmap[msg.sender];
        require (dividends > 0);
        divmap[msg.sender] = 0;
        msg.sender.transfer(dividends);
        emit PayDividends(msg.sender, dividends);
    } 
    
    /**
     * fallback function can be used to receive funds and calculate dividends
     */
    function () public payable {
        receivedDividends = receivedDividends.add(msg.value);
        if (receivedDividends >= crowdSaleContract.hardCap()){
            _CalcDiv();
            receivedDividends = 0;
        }
    }    
}

contract BuyToken {
    using SafeMath for uint256;

    /**
     * @title The contract buys tokens from investors
     */
    address public crowdsaleAddress;
    CrowdSale public crowdSaleContract;
    mapping (address => uint256) divmap;
    event PayDividends(address indexed investor, uint256 amount);

    constructor(address _crowdsaleAddress) public {
        crowdsaleAddress = _crowdsaleAddress;
        crowdSaleContract = CrowdSale(crowdsaleAddress);
    }
    
    /**
     * function buys tokens from investors and burn it
     */
    function buyToken(uint256 _amount) public payable {
        require (_amount > 0);
        require (msg.sender != address(0));
        
        uint256 rate = crowdSaleContract.tokenBuyRate();
        uint256 weiAmount = _amount.div(rate);
        require (weiAmount > 0, "Amount is less than the minimum value");
        require (address(this).balance >= weiAmount, "Contract balance is empty");
        crowdSaleContract.burnTokens(msg.sender, _amount);
        msg.sender.transfer(weiAmount);
    }
    
    /**
     * fallback function can be used to receive funds
     */
    function () public payable {
    } 
}

    /**
     * @title CrowdSale contract for Gradus token
     * https://github.com/chelbukhov/Gradus-smart-contract.git
     */
contract CrowdSale is Ownable{
    using SafeMath for uint256;

    // The token being sold
    address myAddress = this;
    GRADtoken public token = new GRADtoken(myAddress);
    Dividend public dividendContract = new Dividend(myAddress, address(token));
    BuyToken public buyTokenContract = new BuyToken(myAddress);
    // address where funds are collected
    address public wallet = 0x0;

    //tokenSaleRate don't change
    uint256 public tokenSaleRate; 
    uint256 public tokenBuyRate;

    // hardcap for contract dividends
    uint256 public hardCap;
    
    /**
     * Current funds during this period of sale
     * and the upper limit for this period of sales
     */
     uint256 currentFunds = 0;
     uint256 totalFunds = 0;

    // amount of raised money in wei
    uint256 public weiRaised;

    bool private isSaleActive;
    /**
    * event for token purchase logging
    * @param _to who got the tokens
    * @param value weis paid for purchase
    * @param amount amount of tokens purchased
    */
    event TokenSale(address indexed _to, uint256 value, uint256 amount);

    constructor() public {
        /**
         * @dev tokenRate is rate tokens per 1 ether. don't changes.
         */
        tokenSaleRate = 10000;
        tokenBuyRate = 10000;
        /**
         * @dev HardCap is limit in ether for contract
         */
        hardCap = 10;
    }

    modifier onlyBuyTokenContract() {
        require(msg.sender == address(buyTokenContract));
        _;
    }

    modifier restricted(){
        require(msg.sender == owner || msg.sender == address(dividendContract));
        _;
    }

    /**
     * function set upper limit to receive funds
     * value entered in whole ether. 10 = 10 ether
     */
    function setTotalFunds(uint256 _newValue) public onlyOwner {
        totalFunds = _newValue.mul(1 ether);
        currentFunds = 0;
    }

    /**
     * function for burning tokens when buying in a BuyToken contract
     */ 
    function burnTokens(address _seller, uint256 _amountTokens) public onlyBuyTokenContract {
        token.burn(_seller, _amountTokens);
    }

    function setHardcap(uint256 _newValue) public onlyOwner {
        hardCap = _newValue;
    }
    
    function setTokenBuyRate(uint256 _newValue) public onlyOwner {
        tokenBuyRate = _newValue;
    }

    function setProfitAddress() public onlyOwner {
        wallet = msg.sender;
    }

  /**
   * function sale token to investor
   */
  function _saleTokens() internal {
    require(totalFunds <= currentFunds.add(msg.value));      
    require(msg.sender != address(0));
    require(isSaleActive);

    uint256 weiAmount = msg.value;

    // calculate token amount to be created
    uint256 tokens = weiAmount.mul(tokenSaleRate);


    // update state
    weiRaised = weiRaised.add(weiAmount);

    token.mint(msg.sender, tokens);
    emit TokenSale(msg.sender, weiAmount, tokens);
    currentFunds = currentFunds.add(msg.value);
    wallet.transfer(msg.value);
  }

  
    function lockTransfer(bool _lock) public restricted {
        /**
         * @dev This function may be started from owner or dividendContract
         */
        token.lockTransfer(_lock);
    }

  //disable if enabled
  function disableSale() onlyOwner() public returns (bool) {
    require(isSaleActive == true);
    isSaleActive = false;
    return true;
  }

  // enable if diabled
  function enableSale()  onlyOwner() public returns (bool) {
    require(isSaleActive == false);
    isSaleActive = true;
    return true;
  }

  // retruns true if sale is currently active
  function saleStatus() public constant returns (bool){
    return isSaleActive;
  }

  // fallback function can be used to sale tokens
  function () payable public {
    _saleTokens();
  }

}

