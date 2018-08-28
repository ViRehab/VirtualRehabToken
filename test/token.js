const Token = artifacts.require('./VRToken.sol');
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
  describe('Token Creation', () => {
    it('should deploy with correct parameters', async () => {
      let token = await Token.new();
      let owner = accounts[0];
      let expectedMaxSupply = 400000000;
      let expectedInitialSupply = expectedMaxSupply -  60000000 - 750000 - 2085000;
      assert(await token.owner() === owner);
      assert(await token.released() === false);
      assert((await token.decimals()).toNumber() === 18);
      assert(await token.name() === 'VirtualRehab');
      assert(await token.symbol() === 'VRH');
      assert(await token.admins(owner));
      assert((await token.numberOfAdmins()).toNumber() === 1);
      (await token.MAX_SUPPLY()).should.bignumber.equal(ether(expectedMaxSupply));
      (await token.totalSupply()).should.bignumber.equal(ether(expectedInitialSupply));
      (await token.balanceOf(owner)).should.bignumber.equal(ether(expectedInitialSupply));
      assert((await token.ICOEndDate()).toNumber() === 0);
    });
  });
  describe('Admin Functions', () => {
    let token;
    let owner;
    beforeEach(async () => {
      token = await Token.new();
      owner = accounts[0];
    })
    it('new admins can be added only by existing admins', async () => {
      await token.addAdmin(accounts[1]);
      assert(await token.admins(accounts[1]));
      await token.addAdmin(accounts[2], { from: accounts[3]})
      .should.be.rejectedWith(EVMRevert);
    })

    it('new admins can be added only by existing admins', async () => {
      await token.addAdmin(accounts[1]);
      assert(await token.admins(accounts[1]));
      await token.addAdmin(accounts[2], { from: accounts[3]})
      .should.be.rejectedWith(EVMRevert);
      assert((await token.numberOfAdmins()).toNumber() == 2);
    })

    it('admins can be removed by other admins', async () => {
      await token.addAdmin(accounts[1]);
      await token.addAdmin(accounts[2]);
      await token.removeAdmin(accounts[2], { from : accounts[1] });
      assert((await token.admins(accounts[2])) === false);
    });
    it('Zero address cannot be added as admins', async () => {
      const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
      await token.addAdmin(ZERO_ADDRESS).should.be.rejectedWith(EVMRevert);
    })
  });
  describe('Set ICO end date', () => {
    let token;
    beforeEach(async () => {
      token = await Token.new();
    });
    it('should set ICO date', async () => {
      let currentTime = await latestTime();
      const ICOEndDate = currentTime + duration.weeks(1);
      await token.setICOEndDate(ICOEndDate);
      assert((await token.ICOEndDate()).toNumber() === ICOEndDate);
    });
    it('ICO date cannot be set by non admin', async () => {
      let currentTime = await latestTime();
      const ICOEndDate = currentTime + duration.weeks(1);
      await token.setICOEndDate(ICOEndDate, { from: accounts[1] })
      .should.be.rejectedWith(EVMRevert);
    });

    it('ICO date cannot be set twice', async () => {
      let currentTime = await latestTime();
      const ICOEndDate = currentTime + duration.weeks(1);
      await token.setICOEndDate(ICOEndDate);
      await token.setICOEndDate(ICOEndDate)
      .should.be.rejectedWith(EVMRevert)
    });

    it('ICO date cannot be set twice', async () => {
      let currentTime = await latestTime();
      const ICOEndDate = currentTime + duration.weeks(1);
      await token.setICOEndDate(ICOEndDate);
      await token.setICOEndDate(ICOEndDate)
      .should.be.rejectedWith(EVMRevert)
    });

    it('ICO date cannot be set to the latestTime', async () => {
      let currentTime = await latestTime();
      await token.setICOEndDate(currentTime)
      .should.be.rejectedWith(EVMRevert)
    });
  });

  describe('mint tokens for advisors, founders and services', async () => {
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

    it('mint tokens cannot be called non admins ', async () => {
      await token.mintTokensForAdvisors({ from: accounts[3] })
      .should.be.rejectedWith(EVMRevert);
      await token.mintTokensForFounders({ from: accounts[3] })
      .should.be.rejectedWith(EVMRevert);
      await token.mintTokensForServices({ from: accounts[3] })
      .should.be.rejectedWith(EVMRevert);
    });

    it('cannot mint when token is paused', async () => {
      let years_3 = ICOEndDate + duration.years(3);
      await increaseTimeTo(years_3);
      await token.pause();
      await token.mintTokensForAdvisors().should.be.rejectedWith(EVMRevert);
      await token.mintTokensForFounders().should.be.rejectedWith(EVMRevert);
      await token.mintTokensForServices().should.be.rejectedWith(EVMRevert);
    });

    it('cannot mint tokens to founders before 1 year', async () => {
      let lessThan1Year = ICOEndDate + duration.days(30);
      await increaseTimeTo(lessThan1Year);
      await token.mintTokensForFounders()
      .should.be.rejectedWith(EVMRevert);
    })

    it('mint tokens to founders after 1 year', async () => {
      let foundersWallet = accounts[4];
      await token.addAdmin(foundersWallet);
      let moreThan1year = ICOEndDate + duration.years(1);
      let prevSupply = await token.totalSupply();
      await increaseTimeTo(moreThan1year + 10);
      await token.mintTokensForFounders({ from: foundersWallet });
      (await token.balanceOf(foundersWallet))
      .should.be.bignumber.equal(ether(60000000));
      let currentSupply = await token.totalSupply();
      (currentSupply.sub(prevSupply)).should.be.bignumber.equal(ether(60000000));
    })

    it('mint tokens to founders after 1 year cannot be called twice', async () => {
      let foundersWallet = accounts[4];
      await token.addAdmin(foundersWallet);
      let moreThan1year = ICOEndDate + duration.years(1);
      await increaseTimeTo(moreThan1year + 10);
      await token.mintTokensForFounders({ from: foundersWallet });
      await token.mintTokensForFounders( { from:  foundersWallet })
      .should.be.rejectedWith(EVMRevert);
    })

    it('cannot mint to advisors before 1 year', async () => {
      let lessThan1Year = ICOEndDate + duration.days(30);
      await increaseTimeTo(lessThan1Year);
      await token.mintTokensForAdvisors()
      .should.be.rejectedWith(EVMRevert);
    })

    it('mint tokens to advisors after 1 year', async () => {
      let advisorsWallet = accounts[5];
      await token.addAdmin(advisorsWallet);
      let moreThan1year = ICOEndDate + duration.years(1);
      let prevSupply = await token.totalSupply();
      await increaseTimeTo(moreThan1year + 10);
      await token.mintTokensForAdvisors({ from: advisorsWallet });
      (await token.balanceOf(advisorsWallet)).should.be.bignumber.equal(ether(750000));
      let currentSupply = await token.totalSupply();
      (currentSupply.sub(prevSupply)).should.be.bignumber.equal(ether(750000));
    })

    it('mint tokens to advisors after 1 year cannot be called twice', async () => {
      let advisorsWallet = accounts[5];
      await token.addAdmin(advisorsWallet);
      let moreThan1year = ICOEndDate + duration.years(1);
      await increaseTimeTo(moreThan1year + 10);
      await token.mintTokensForAdvisors({ from: advisorsWallet });
      await token.mintTokensForAdvisors({ from : advisorsWallet })
      .should.be.rejectedWith(EVMRevert);
    });

    it('mint tokens to services cannot be called within 2 months after the ICO date has been set', async () => {
      let lessThan2Months = ICOEndDate + duration.weeks(2);
      await increaseTimeTo(lessThan2Months);
      await token.mintTokensForServices().should.be.rejectedWith(EVMRevert);
    });

    it('mint tokens to services after 2 months', async () => {
      let servicesWallet = accounts[5];
      await token.addAdmin(servicesWallet);
      let twoMonths = ICOEndDate + duration.days(60);
      await increaseTimeTo(twoMonths + 10);
      let prevSupply = await token.totalSupply();
      await token.mintTokensForServices({ from: servicesWallet })
      let balance = await token.balanceOf(servicesWallet)
      balance.should.be.bignumber.equal(ether(2085000));
      let currentSupply = await token.totalSupply();
      currentSupply.sub(prevSupply).should.be.bignumber.equal(ether(2085000));
    });

    it('mint tokens to services cannot be called twice', async () => {
      let servicesWallet = accounts[5];
      await token.addAdmin(servicesWallet);
      let twoMonths = ICOEndDate + duration.days(60);
      await increaseTimeTo(twoMonths + 10);
      await token.mintTokensForServices({ from: servicesWallet })
      await token.mintTokensForServices({ from: servicesWallet })
      .should.be.rejectedWith(EVMRevert);
    })
    it('after all the mints the total supply must be equal to MAX_SUPPLY', async () => {
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
  describe('Minting before ICO is over', () => {
    it('Cannot mint before ICO is over', async () => {
      let token = await Token.new();
      let currentTime = await latestTime();
      let after3Years = currentTime + duration.years(3);
      await increaseTimeTo(after3Years);
      await token.mintTokensForAdvisors().should.be.rejectedWith(EVMRevert);
      await token.mintTokensForFounders().should.be.rejectedWith(EVMRevert);
      await token.mintTokensForServices().should.be.rejectedWith(EVMRevert);
    })
  })
  describe('releaseTokenForTransfer', () => {
    it('released token sets released to true', async () => {
      let token = await Token.new();
      await token.releaseTokenForTransfer()
      let released = await token.released();
      assert(released === true);
    })
    it('Release token transfer can be called only by admin', async () => {
      let token = await Token.new();
      await token.releaseTokenForTransfer({ from: accounts[1] })
      .should.be.rejectedWith(EVMRevert);
    });

    it('Release token transfer cannot be done when its paused', async () => {
      let token = await Token.new();
      await token.pause();
      await token.releaseTokenForTransfer({ from: accounts[1] })
      .should.be.rejectedWith(EVMRevert);
    });
  });

  describe('ERC20 functions: before token transfer release', async () => {
    let token;
    beforeEach(async () => {
      token = await Token.new();
      await token.addAdmin(accounts[1]);
    })
    it('transfer can be called only by admin', async () => {
      await token.transfer(accounts[1], 10);
      let balance = await token.balanceOf(accounts[1]);
      assert(balance.toNumber() == 10);
      await token.transfer(accounts[2], 9, { from: accounts[1] });
      let accounts2Balance = await token.balanceOf(accounts[2]);
      assert(accounts2Balance.toNumber() === 9);
      await token.transfer(accounts[3], 8, { from: accounts[2] })
      .should.be.rejectedWith(EVMRevert);
    })

    it('approve from can be called only admins', async () => {
      await token.approve(accounts[3], 10);
      let account3Allowance = await token.allowance(accounts[0], accounts[3]);
      assert(account3Allowance.toNumber() == 10);
      await token.transfer(accounts[3], 10);
      await token.approve(accounts[2], 9, { from: accounts[3] })
      .should.be.rejectedWith(EVMRevert);
    })

    it('increaseApproval from can be called only admins', async () => {
      await token.approve(accounts[3], 10);
      await token.increaseApproval(accounts[3], 1);
      let account3Allowance = await token.allowance(accounts[0], accounts[3]);
      assert(account3Allowance.toNumber() == 11);
      await token.transfer(accounts[1], 11);
      await token.approve(accounts[3], 10, { from: accounts[1] });
      await token.removeAdmin(accounts[1]);
      await token.increaseApproval(accounts[3], 1, { from: accounts[1] })
      .should.be.rejectedWith(EVMRevert);
    });

    it('decreaseApproval from can be called only admins', async () => {
      await token.approve(accounts[3], 10);
      await token.decreaseApproval(accounts[3], 1);
      let account3Allowance = await token.allowance(accounts[0], accounts[3]);
      assert(account3Allowance.toNumber() == 9);
      await token.transfer(accounts[1], 11);
      await token.approve(accounts[3], 10, { from: accounts[1] });
      await token.removeAdmin(accounts[1]);
      await token.decreaseApproval(accounts[3], 1, { from: accounts[1] })
      .should.be.rejectedWith(EVMRevert);
    });

    it('transferFrom can done from only admin accounts', async () => {
      await token.approve(accounts[3], 10);
      await token.transferFrom(accounts[0], accounts[2], 1, { from: accounts[3] });
      let balance = await token.balanceOf(accounts[2]);
      assert(balance.toNumber() === 1);

      await token.transfer(accounts[1], 10);
      await token.approve(accounts[4], 10, { from : accounts[1] });
      await token.removeAdmin(accounts[1]);
      await token.transferFrom(accounts[1], accounts[0], 1, { from: accounts[4] })
      .should.be.rejectedWith(EVMRevert);
    });
  });
  describe('ERC20 functions: when paused', async () => {
    let token;
    beforeEach(async () => {
      token = await Token.new();
      await token.addAdmin(accounts[1]);
      await token.releaseTokenForTransfer();
      await token.pause();
    })
    it('transfer can be called only by admin', async () => {
      await token.transfer(accounts[1], 10);
      let balance = await token.balanceOf(accounts[1]);
      assert(balance.toNumber() == 10);
      await token.transfer(accounts[2], 9, { from: accounts[1] });
      let accounts2Balance = await token.balanceOf(accounts[2]);
      assert(accounts2Balance.toNumber() === 9);
      await token.transfer(accounts[3], 8, { from: accounts[2] })
      .should.be.rejectedWith(EVMRevert);
    })

    it('approve from can be called only admins', async () => {
      await token.approve(accounts[3], 10);
      let account3Allowance = await token.allowance(accounts[0], accounts[3]);
      assert(account3Allowance.toNumber() == 10);
      await token.transfer(accounts[3], 10);
      await token.approve(accounts[2], 9, { from: accounts[3] })
      .should.be.rejectedWith(EVMRevert);
    })

    it('increaseApproval from can be called only admins', async () => {
      await token.approve(accounts[3], 10);
      await token.increaseApproval(accounts[3], 1);
      let account3Allowance = await token.allowance(accounts[0], accounts[3]);
      assert(account3Allowance.toNumber() == 11);
      await token.transfer(accounts[1], 11);
      await token.approve(accounts[3], 10, { from: accounts[1] });
      await token.removeAdmin(accounts[1]);
      await token.increaseApproval(accounts[3], 1, { from: accounts[1] })
      .should.be.rejectedWith(EVMRevert);
    });

    it('decreaseApproval from can be called only admins', async () => {
      await token.approve(accounts[3], 10);
      await token.decreaseApproval(accounts[3], 1);
      let account3Allowance = await token.allowance(accounts[0], accounts[3]);
      assert(account3Allowance.toNumber() == 9);
      await token.transfer(accounts[1], 11);
      await token.approve(accounts[3], 10, { from: accounts[1] });
      await token.removeAdmin(accounts[1]);
      await token.decreaseApproval(accounts[3], 1, { from: accounts[1] })
      .should.be.rejectedWith(EVMRevert);
    });

    it('transferFrom can done from only admin accounts', async () => {
      await token.approve(accounts[3], 10);
      await token.transferFrom(accounts[0], accounts[2], 1, { from: accounts[3] });
      let balance = await token.balanceOf(accounts[2]);
      assert(balance.toNumber() === 1);
      await token.transfer(accounts[1], 10);
      await token.approve(accounts[4], 10, { from : accounts[1] });
      await token.removeAdmin(accounts[1]);
      await token.transferFrom(accounts[1], accounts[0], 1, { from: accounts[4] })
      .should.be.rejectedWith(EVMRevert);
    });
  });

  describe('ERC20 functions after token transfer release', async () => {
    let token;
    beforeEach(async () => {
      token = await Token.new();
      await token.transfer(accounts[1], 10);
      await token.releaseTokenForTransfer();
    })
    it('transfer function', async () => {
      await token.transfer(accounts[2], 10, { from: accounts[1] });
      let balance = await token.balanceOf(accounts[2]);
      assert(balance.toNumber() == 10);
    })

    it('approve function', async () => {
      await token.approve(accounts[3], 10, { from: accounts[1] });
      let account3Allowance = await token.allowance(accounts[1], accounts[3]);
      assert(account3Allowance.toNumber() == 10);
    });

    it('increaseApproval function', async () => {
      await token.approve(accounts[3], 8, { from : accounts[1] });
      await token.increaseApproval(accounts[3], 1, { from: accounts[1] });
      let account3Allowance = await token.allowance(accounts[1], accounts[3]);
      assert(account3Allowance.toNumber() == 9);
    });

    it('decreaseApproval function', async () => {
      await token.approve(accounts[3], 10, { from: accounts[1] });
      await token.decreaseApproval(accounts[3], 1, { from: accounts[1] });
      let account3Allowance = await token.allowance(accounts[1], accounts[3]);
      assert(account3Allowance.toNumber() == 9);
    });

    it('transferFrom function', async () => {
      await token.approve(accounts[3], 10, { from: accounts[1] });
      await token.transferFrom(accounts[1], accounts[2], 1, { from: accounts[3] });
      let balance = await token.balanceOf(accounts[2]);
      assert(balance.toNumber() === 1);
    });
  });
});
