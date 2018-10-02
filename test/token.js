const Token = artifacts.require('./VRHToken.sol');
const BigNumber = require('bignumber.js');
const EVMRevert = require('./helpers/EVMRevert').EVMRevert;
const ether = require('./helpers/ether').ether;
const latestTime  = require('./helpers/latestTime').latestTime;
const increaseTime = require('./helpers/increaseTime');
const increaseTimeTo = increaseTime.increaseTimeTo;
const duration = increaseTime.duration;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('token', function(accounts) {
  describe('Token Creation Ruleset', () => {
    it('must correctly deploy with correct parameters and state variables.', async () => {
      let token = await Token.new();
      let owner = accounts[0];
      let expectedMaxSupply = 400000000;
      let expectedInitialSupply = expectedMaxSupply -  60000000 - 1650000 - 2085000;

      assert(await token.owner() === owner);
      assert(await token.released() === false);
      assert((await token.decimals()).toNumber() === 18);
      assert(await token.name() === 'VirtualRehab');
      assert(await token.symbol() === 'VRH');

      (await token.MAX_SUPPLY()).should.bignumber.equal(ether(expectedMaxSupply));
      (await token.totalSupply()).should.bignumber.equal(ether(expectedInitialSupply));
      (await token.balanceOf(owner)).should.bignumber.equal(ether(expectedInitialSupply));

      assert((await token.ICOEndDate()).toNumber() === 0);
    });
  });

  describe('Admin Functions Ruleset', () => {
    let token;
    let owner;

    beforeEach(async () => {
      token = await Token.new();
      owner = accounts[0];
    });

    it('must allow new admins to be added only by existing admins.', async () => {
      await token.addAdmin(accounts[1]);

      assert(await token.admins(accounts[1]));
      await token.addAdmin(accounts[2], { from: accounts[3]}).should.be.rejectedWith(EVMRevert);
    });

    it('must correctly count the number of admins.', async () => {
      await token.addAdmin(accounts[1]);
      assert(await token.admins(accounts[1]));
      await token.addAdmin(accounts[2], { from: accounts[3]}).should.be.rejectedWith(EVMRevert);
    });

    it('must allow admins to be removed by other admins.', async () => {
      await token.addAdmin(accounts[1]);
      await token.addAdmin(accounts[2]);

      await token.removeAdmin(accounts[2], { from : accounts[1] });
      assert((await token.admins(accounts[2])) === false);
    });

    it('must not allow zero address to be added as an admin.', async () => {
      const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
      await token.addAdmin(ZERO_ADDRESS).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('ICO End Ruleset', () => {
    let token;

    beforeEach(async () => {
      token = await Token.new();
    });

    it('must properly set the ICO end date.', async () => {
      let currentTime = await latestTime();
      const ICOEndDate = currentTime + duration.weeks(1);

      await token.setICOEndDate(ICOEndDate);
      assert((await token.ICOEndDate()).toNumber() === ICOEndDate);
    });

    it('must not allow non admins to set the ICO end date.', async () => {
      let currentTime = await latestTime();
      const ICOEndDate = currentTime + duration.weeks(1);

      await token.setICOEndDate(ICOEndDate, { from: accounts[1] }).should.be.rejectedWith(EVMRevert);
    });

    it('must not allow ICO end date to be set more than once.', async () => {
      let currentTime = await latestTime();
      const ICOEndDate = currentTime + duration.weeks(1);

      await token.setICOEndDate(ICOEndDate);
      await token.setICOEndDate(ICOEndDate).should.be.rejectedWith(EVMRevert)
    });

    it('must ensure that ICO end date is a future date.', async () => {
      let currentTime = await latestTime();
      await token.setICOEndDate(currentTime).should.be.rejectedWith(EVMRevert)
    });
  });

  describe('Minting Ruleset', async () => {
    let token;
    let mintingAccount = accounts[2];
    let ICOEndDate;

    beforeEach(async () => {
      token = await Token.new();
      await token.addAdmin(mintingAccount);
      let currentTime = await latestTime();
      ICOEndDate = currentTime + duration.weeks(1);
      await token.setICOEndDate(ICOEndDate);
      await increaseTimeTo(ICOEndDate + 1);
    });

    it('must not allow non admins to request minting or receive the remaining tokens.', async () => {
      await token.mintTokensForAdvisors({ from: accounts[3] }).should.be.rejectedWith(EVMRevert);
      await token.mintTokensForFounders({ from: accounts[3] }).should.be.rejectedWith(EVMRevert);
      await token.mintTokensForServices({ from: accounts[3] }).should.be.rejectedWith(EVMRevert);
    });

    it('must not allow minting when token is paused.', async () => {
      let years_3 = ICOEndDate + duration.years(3);

      await increaseTimeTo(years_3);
      await token.pause();

      await token.mintTokensForAdvisors().should.be.rejectedWith(EVMRevert);
      await token.mintTokensForFounders().should.be.rejectedWith(EVMRevert);
      await token.mintTokensForServices().should.be.rejectedWith(EVMRevert);
    });

    it('must not allow minting of founder tokens before 1 year from the ICO end date.', async () => {
      let lessThan1Year = ICOEndDate + duration.days(30);
      await increaseTimeTo(lessThan1Year);

      await token.mintTokensForFounders().should.be.rejectedWith(EVMRevert);
    });

    it('must allow minting of founder tokens after 1 year of the ICO end date.', async () => {
      let foundersWallet = accounts[4];
      await token.addAdmin(foundersWallet);

      let moreThan1year = ICOEndDate + duration.years(2);
      let prevSupply = await token.totalSupply();

      await increaseTimeTo(moreThan1year + 10);
      await token.mintTokensForFounders({ from: foundersWallet });

      (await token.balanceOf(foundersWallet)).should.be.bignumber.equal(ether(60000000));

      let currentSupply = await token.totalSupply();
      (currentSupply.sub(prevSupply)).should.be.bignumber.equal(ether(60000000));
    });

    it('must not allow founder token allocation to be minted more than once.', async () => {
      let foundersWallet = accounts[4];
      await token.addAdmin(foundersWallet);

      let moreThan2year = ICOEndDate + duration.years(2);

      await increaseTimeTo(moreThan2year + 10);
      await token.mintTokensForFounders({ from: foundersWallet });
      await token.mintTokensForFounders( { from:  foundersWallet }).should.be.rejectedWith(EVMRevert);
    });

    it('must not allow minting of advisor tokens before 1 year from the ICO end date.', async () => {
      let lessThan1Year = ICOEndDate + duration.days(30);
      await increaseTimeTo(lessThan1Year);
      await token.mintTokensForAdvisors().should.be.rejectedWith(EVMRevert);
    });

    it('must allow minting of advisor tokens after 1 year of the ICO end date.', async () => {
      let advisorsWallet = accounts[5];
      await token.addAdmin(advisorsWallet);
      let moreThan1year = ICOEndDate + duration.years(1);
      let prevSupply = await token.totalSupply();
      await increaseTimeTo(moreThan1year + 10);
      await token.mintTokensForAdvisors({ from: advisorsWallet });
      (await token.balanceOf(advisorsWallet)).should.be.bignumber.equal(ether(1650000));
      let currentSupply = await token.totalSupply();
      (currentSupply.sub(prevSupply)).should.be.bignumber.equal(ether(1650000));
    });

    it('must not allow advisor token allocation to be minted more than once.', async () => {
      let advisorsWallet = accounts[5];
      await token.addAdmin(advisorsWallet);
      let moreThan1year = ICOEndDate + duration.years(1);

      await increaseTimeTo(moreThan1year + 10);
      await token.mintTokensForAdvisors({ from: advisorsWallet });
      await token.mintTokensForAdvisors({ from : advisorsWallet }).should.be.rejectedWith(EVMRevert);
    });

    it('must not allow minting of service tokens before 2 months from the ICO end date.', async () => {
      let lessThan2Months = ICOEndDate + duration.weeks(2);
      await increaseTimeTo(lessThan2Months);
      await token.mintTokensForServices().should.be.rejectedWith(EVMRevert);
    });

    it('must allow minting of service tokens after 2 months of the ICO end date.', async () => {
      let servicesWallet = accounts[5];
      await token.addAdmin(servicesWallet);

      let twoMonths = ICOEndDate + duration.days(60);
      await increaseTimeTo(twoMonths + 10);

      let prevSupply = await token.totalSupply();
      await token.mintTokensForServices({ from: servicesWallet });

      let balance = await token.balanceOf(servicesWallet)
      balance.should.be.bignumber.equal(ether(2085000));

      let currentSupply = await token.totalSupply();
      currentSupply.sub(prevSupply).should.be.bignumber.equal(ether(2085000));
    });

    it('must not allow service token allocation to be minted more than once.', async () => {
      let servicesWallet = accounts[5];
      await token.addAdmin(servicesWallet);

      let twoMonths = ICOEndDate + duration.days(60);
      await increaseTimeTo(twoMonths + 10);
      await token.mintTokensForServices({ from: servicesWallet });
      await token.mintTokensForServices({ from: servicesWallet }).should.be.rejectedWith(EVMRevert);
    });

    it('must result in the toal supply being equal to the maximum supply once all tokens are minted.', async () => {
      let after3Years = ICOEndDate + duration.years(3);

      await increaseTimeTo(after3Years);
      await token.mintTokensForAdvisors();
      await token.mintTokensForFounders();
      await token.mintTokensForServices();

      let MAX_SUPPLY = await token.MAX_SUPPLY();
      let totalSupply = await token.totalSupply();

      totalSupply.should.be.bignumber.equal(MAX_SUPPLY);
    });
  });

  describe('Minting Ruleset Continued', () => {
    it('must not allow minting before ICO is over.', async () => {
      let token = await Token.new();
      let currentTime = await latestTime();
      let after3Years = currentTime + duration.years(3);

      await increaseTimeTo(after3Years);
      await token.mintTokensForAdvisors().should.be.rejectedWith(EVMRevert);
      await token.mintTokensForFounders().should.be.rejectedWith(EVMRevert);
      await token.mintTokensForServices().should.be.rejectedWith(EVMRevert);
    });
  });

  describe('Token Transfer State Ruleset', () => {
    it('must properly set the release state variable.', async () => {
      let token = await Token.new();
      await token.releaseTokenForTransfer();

      let released = await token.released();
      assert(released === true);
    });

    it('must only allow admins to release tokens for transfers.', async () => {
      let token = await Token.new();

      await token.releaseTokenForTransfer({ from: accounts[1] }).should.be.rejectedWith(EVMRevert);
    });

    it('must not allow anyone to release tokens for transfer when the token is paused.', async () => {
      let token = await Token.new();
      await token.pause();
      await token.releaseTokenForTransfer({ from: accounts[1] }).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('ERC20 Feature Ruleset (When Transfer State is Disabled)', async () => {
    let token;

    beforeEach(async () => {
      token = await Token.new();
      await token.addAdmin(accounts[1]);
    });

    it('must only allow an admin to transfer tokens when the transfer state is disabled.', async () => {
      await token.transfer(accounts[1], 10);
      let balance = await token.balanceOf(accounts[1]);
      assert(balance.toNumber() == 10);

      await token.transfer(accounts[2], 9, { from: accounts[1] });
      let accounts2Balance = await token.balanceOf(accounts[2]);
      assert(accounts2Balance.toNumber() === 9);

      await token.transfer(accounts[3], 8, { from: accounts[2] }).should.be.rejectedWith(EVMRevert);
    });

    it('must only allow an admin to approve spenders when the transfer state is disabled.', async () => {
      await token.approve(accounts[3], 10);
      let account3Allowance = await token.allowance(accounts[0], accounts[3]);
      assert(account3Allowance.toNumber() == 10);

      await token.transfer(accounts[3], 10);
      await token.approve(accounts[2], 9, { from: accounts[3] }).should.be.rejectedWith(EVMRevert);
    });

    it('must only allow an admin to increase approvals when the transfer state is disabled.', async () => {
      await token.approve(accounts[3], 10);
      await token.increaseApproval(accounts[3], 1);

      let account3Allowance = await token.allowance(accounts[0], accounts[3]);
      assert(account3Allowance.toNumber() == 11);

      await token.transfer(accounts[1], 11);
      await token.approve(accounts[3], 10, { from: accounts[1] });
      await token.removeAdmin(accounts[1]);
      await token.increaseApproval(accounts[3], 1, { from: accounts[1] }).should.be.rejectedWith(EVMRevert);
    });

    it('must only allow an admin to decrease approvals when the transfer state is disabled.', async () => {
      await token.approve(accounts[3], 10);
      await token.decreaseApproval(accounts[3], 1);

      let account3Allowance = await token.allowance(accounts[0], accounts[3]);
      assert(account3Allowance.toNumber() == 9);

      await token.transfer(accounts[1], 11);
      await token.approve(accounts[3], 10, { from: accounts[1] });
      await token.removeAdmin(accounts[1]);
      await token.decreaseApproval(accounts[3], 1, { from: accounts[1] }).should.be.rejectedWith(EVMRevert);
    });

    it('must only allow an admin to transfer from approved accounts when the transfer state is disabled.', async () => {
      await token.approve(accounts[3], 10);
      await token.transferFrom(accounts[0], accounts[2], 1, { from: accounts[3] });
      let balance = await token.balanceOf(accounts[2]);
      assert(balance.toNumber() === 1);

      await token.transfer(accounts[1], 10);
      await token.approve(accounts[4], 10, { from : accounts[1] });
      await token.removeAdmin(accounts[1]);
      await token.transferFrom(accounts[1], accounts[0], 1, { from: accounts[4] }).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('ERC20 Feature Ruleset (When Paused)', async () => {
    let token;

    beforeEach(async () => {
      token = await Token.new();
      await token.addAdmin(accounts[1]);
      await token.releaseTokenForTransfer();
      await token.pause();
    });

    it('must only allow an admin to transfer when the token is paused.', async () => {
      await token.transfer(accounts[1], 10);
      let balance = await token.balanceOf(accounts[1]);
      assert(balance.toNumber() == 10);

      await token.transfer(accounts[2], 9, { from: accounts[1] });
      let accounts2Balance = await token.balanceOf(accounts[2]);
      assert(accounts2Balance.toNumber() === 9);

      await token.transfer(accounts[3], 8, { from: accounts[2] }).should.be.rejectedWith(EVMRevert);
    });

    it('must only allow an admin to approve spenders when the token is paused.', async () => {
      await token.approve(accounts[3], 10);
      let account3Allowance = await token.allowance(accounts[0], accounts[3]);
      assert(account3Allowance.toNumber() == 10);

      await token.transfer(accounts[3], 10);
      await token.approve(accounts[2], 9, { from: accounts[3] }).should.be.rejectedWith(EVMRevert);
    });

    it('must only allow an admin to increase approvals when the token is paused.', async () => {
      await token.approve(accounts[3], 10);

      await token.increaseApproval(accounts[3], 1);
      let account3Allowance = await token.allowance(accounts[0], accounts[3]);
      assert(account3Allowance.toNumber() == 11);

      await token.transfer(accounts[1], 11);
      await token.approve(accounts[3], 10, { from: accounts[1] });
      await token.removeAdmin(accounts[1]);
      await token.increaseApproval(accounts[3], 1, { from: accounts[1] }).should.be.rejectedWith(EVMRevert);
    });

    it('must only allow an admin to decrease approvals when the token is paused.', async () => {
      await token.approve(accounts[3], 10);

      await token.decreaseApproval(accounts[3], 1);
      let account3Allowance = await token.allowance(accounts[0], accounts[3]);
      assert(account3Allowance.toNumber() == 9);

      await token.transfer(accounts[1], 11);
      await token.approve(accounts[3], 10, { from: accounts[1] });
      await token.removeAdmin(accounts[1]);
      await token.decreaseApproval(accounts[3], 1, { from: accounts[1] }).should.be.rejectedWith(EVMRevert);
    });

    it('must only allow an admin to transfer from approved accounts when the token is paused.', async () => {
      await token.approve(accounts[3], 10);

      await token.transferFrom(accounts[0], accounts[2], 1, { from: accounts[3] });
      let balance = await token.balanceOf(accounts[2]);
      assert(balance.toNumber() === 1);

      await token.transfer(accounts[1], 10);
      await token.approve(accounts[4], 10, { from : accounts[1] });
      await token.removeAdmin(accounts[1]);
      await token.transferFrom(accounts[1], accounts[0], 1, { from: accounts[4] }).should.be.rejectedWith(EVMRevert);
    });
  });


  describe('Token Burn Ruleset', async () => {
    let token;

    beforeEach(async () => {
      token = await Token.new();
      await token.addAdmin(accounts[2]);
      await token.transfer(accounts[2], 10);
    });

    it('must correctly reduce the total supply when the burn feature is used.', async () => {
      let totalSupply = await token.totalSupply();
      await token.burn(1, {from: accounts[2]});

      (await token.totalSupply()).should.be.bignumber.equal(totalSupply.sub(1));
    });

    it('must correctly reduce the balance when the burn feature is used.', async () => {
      let balance = await token.balanceOf(accounts[2]);
      await token.burn(1, {from: accounts[2]});

      (await token.balanceOf(accounts[2])).should.be.bignumber.equal(balance.sub(1));
    });
  });


  describe('Bulk Token Transfer Ruleset', async () => {
    let token;

    beforeEach(async () => {
      token = await Token.new();
      await token.addAdmin(accounts[2]);
    });

    it('must correctly perform bulk transfers.', async () => {
      const destinations = [];
      const balances = [];

      for(let i=3;i<7;i++) {
        destinations.push(accounts[i]);
        balances.push(i);
      };

      await token.bulkTransfer(destinations, balances);

      for(let i=0;i<destinations.length;i++) {
        let balance = await token.balanceOf(destinations[i]);
        assert(balance == balances[i]);
      };
    });

    it('must not allow non-whitelisted (non-admin) addresses to bulk transfers.', async () => {
      const balances = [];
      const destinations = [];

      for(let i=1;i<4;i++) {
        destinations.push(accounts[i]);
        balances.push(i);
      };

      await token.bulkTransfer(destinations, balances, { from: accounts[1] }).should.be.rejectedWith(EVMRevert);
    });

    it('must revert when the balance is less than the sum.', async () => {
      const balances = [];
      const destinations = [];

      for(let i=1;i<4;i++) {
        destinations.push(accounts[i]);
        balances.push(i);
      };

      let currentBalance = await token.balanceOf(accounts[0]);

      await token.transfer(accounts[6], currentBalance);
      await token.bulkTransfer(destinations, balances, { from: accounts[0] }).should.be.rejectedWith(EVMRevert);
    });
  });


  describe('ERC20 Feature Ruleset (When Transfer State is Enabled)', async () => {
    let token;
    beforeEach(async () => {
      token = await Token.new();
      await token.transfer(accounts[1], 10);
      await token.releaseTokenForTransfer();
    });

    it('must enable transfers for everyone when the token is not paused and the transfer state is released.', async () => {
      await token.transfer(accounts[2], 10, { from: accounts[1] });
      let balance = await token.balanceOf(accounts[2]);
      assert(balance.toNumber() == 10);
    });

    it('must enable approvals for everyone when the token is not paused and the transfer state is released.', async () => {
      await token.approve(accounts[3], 10, { from: accounts[1] });
      let account3Allowance = await token.allowance(accounts[1], accounts[3]);
      assert(account3Allowance.toNumber() == 10);
    });

    it('must allow increasing approvals for everyone when the token is not paused and the transfer state is released.', async () => {
      await token.approve(accounts[3], 8, { from : accounts[1] });
      await token.increaseApproval(accounts[3], 1, { from: accounts[1] });
      let account3Allowance = await token.allowance(accounts[1], accounts[3]);
      assert(account3Allowance.toNumber() == 9);
    });

    it('must allow decreasing approvals for everyone when the token is not paused and the transfer state is released.', async () => {
      await token.approve(accounts[3], 10, { from: accounts[1] });
      await token.decreaseApproval(accounts[3], 1, { from: accounts[1] });
      let account3Allowance = await token.allowance(accounts[1], accounts[3]);
      assert(account3Allowance.toNumber() == 9);
    });

    it('must allow transfer from approved accounts for everyone when the token is not paused and the transfer state is released.', async () => {
      await token.approve(accounts[3], 10, { from: accounts[1] });
      await token.transferFrom(accounts[1], accounts[2], 1, { from: accounts[3] });
      let balance = await token.balanceOf(accounts[2]);
      assert(balance.toNumber() === 1);
    });
  });
});
