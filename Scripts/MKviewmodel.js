"use strict";
var mmviewmodel = mmviewmodel || {};

mmviewmodel.CardTypeEnum = {
    'Fire': 10,
    'Earth': 11,
    'Wind': 12,
    'Water': 13
};

mmviewmodel.CardStatusEnum = {
    'InDeck': 20,
    'InHand': 21,
    'OnTable': 22,
    'GraveYard': 23
};

mmviewmodel.CardViewModel = function () {
    var self = this;
    self.Name = "unknown card";
    self.BelongsToPlayer = 1;
    self.DMG = 0;
    self.DEF = 0;
    self.BaseDMG = 0;
    self.BaseDEF = 0;
    self.TYPE = mmviewmodel.CardTypeEnum.Fire;
    self.x = 0;
    self.y = 0;
    self.CardBitmap = null;
    self.OrientationCoef = 1;
    self.DMGText = null;
    self.DEFText = null;
    self.IsSelected = false;
    self.Hide = false;
    self.Status = mmviewmodel.CardStatusEnum.InDeck;
    self.HandIndex = 0;
    self.TableIndex = -1;
    self.CardIndex = 0;
};

mmviewmodel.PlayerViewModel = function () {
    var self = this;
    self.Name = "Uknown Knight";
    self.Level = 1;
    self.EXP = 0;
    self.PointsToSpend = 3;
    self.Wins = 0;
    self.Losses = 0;
    self.HP = 20;
    self.CurrentHP = 20;
    self.STR = 0;
    self.DEX = 0;
    self.MAG = 0;
    self.CON = 0;
    self.FIRE = 0;
    self.EARTH = 0;
    self.WIND = 0;
    self.WATER = 0;

    self.canSpendPoints = function () {
        if (self.PointsToSpend > 0) {
            return true;
        }
        return false;
    };

    self.addSTR = function (newStr) {
        if (newStr != null) {
            self.STR += newStr;
            self.PointsToSpend -= newStr;
        }
        else{
            self.STR += 1;
            self.PointsToSpend -= 1;
        }
        self.calculateResistances(self);
    };

    self.addDEX = function (newDex) {
        if (newDex != null) {
            self.DEX += newDex;
            self.PointsToSpend -= newDex;
        }
        else{
            self.DEX += 1;
            self.PointsToSpend -= 1;
        }
        self.calculateResistances(self);
    };

    self.addMAG = function (newMag) {
        if (newMag != null) {
            self.MAG += newMag;
            self.PointsToSpend -= newMag;
        }
        else {
            self.MAG += 1;
            self.PointsToSpend -= 1;
        }
        self.calculateResistances(self);
    };

    self.addCON = function (newCon) {
        if (newCon != null) {
            self.CON += newCon;
            self.PointsToSpend -= newCon;
        }
        else {
            self.CON += 1;
            self.PointsToSpend -= 1;
        }

        self.calculateResistances();
        self.calculateHP();
    };

    self.calculateHP = function () {
        self.HP = 20 + 2 * self.CON;
    };

    self.calculateResistances = function () {
        self.FIRE = self.calculateFire();
        self.EARTH = self.calculateEarth();
        self.WIND = self.calculateWind();
        self.WATER = self.calculateWater();
    };

    self.calculateEarth = function () {
        return self.STR + self.MAG;
    };

    self.calculateFire = function () {
        return self.STR + self.MAG;
    };

    self.calculateWind = function () {
        return self.DEX + self.MAG;
    };

    self.calculateWater = function () {
        return self.DEX + self.CON;
    };

    self.levelUp = function (addStr, addDef, addMag, addCon) {
        self.Level += 1;
        self.STR += addStr;
        self.DEX += addDef;
        self.MAG += addMag;
        self.CON += addCon;
        self.calculateResistances();
    };
};

mmviewmodel.numberOfCardsInHand = function (playercards) {
    var cardsInHand = 0;
    for (var i = 0; i < playercards.length ; i++) {
        if (playercards[i].Status == mmviewmodel.CardStatusEnum.InHand) {
            cardsInHand += 1;
        }
    }
    return cardsInHand;
};

mmviewmodel.numberOfCardsOnTable = function (playercards) {
    var cardsOnTable = 0;
    for (var i = 0; i < playercards.length ; i++) {
        if (playercards[i].Status == mmviewmodel.CardStatusEnum.OnTable) {
            cardsOnTable += 1;
        }
    }
    return cardsOnTable;
};

mmviewmodel.GameViewModel = function () {
    var self = this;
    self.Name = "Moruthro Knights";
    self.MaxNumberOfCards = 5;
    self.Player1 = new mmviewmodel.PlayerViewModel();
    self.Player1Cards = [];
    self.Player2 = new mmviewmodel.PlayerViewModel();
    self.Player2Cards = [];
    self.Turn = 1;
    self.CurrentPlayer = 1;
    self.GameStart = function () {
        self.Turn = 1;
        self.Player1Cards = [];
        var generatedPl1Cards = mmgamelogic.populateCards(1, number_of_cards, 3 * (canvas_height / 4) + 100, false, 1);
        self.Player1Cards = self.Player1Cards.concat(generatedPl1Cards);

        self.Player2Cards = [];
        self.Player2Cards = self.Player2Cards.concat(mmgamelogic.populateCards(2, 5, 0, true, -1));

        mmgamelogic.renderCards(self.Player1Cards, false);
        mmgamelogic.renderCards(self.Player2Cards, true);
    };

    self.hasMaxNumOfCardsInHand = function (playercards) {
        var cardsInHand = mmviewmodel.numberOfCardsInHand(playercards);
        if (cardsInHand < max_num_of_cards_in_hand) {
            return false;
        }
        return true;
    }

    self.DrawCard = function (isPlayersMove, playercards) {
        var cardsInHand = mmviewmodel.numberOfCardsInHand(playercards);
        if (cardsInHand < max_num_of_cards_in_hand) {
            var orientationcoef = 1;
            var belongsToPlayer = 1;
            var hidecards = false;

            if (!isPlayersMove) {
                orientationcoef = -1;
                belongsToPlayer = 2;
                hidecards = true;
            }

            var temp = mmgamelogic.createRandomCard(belongsToPlayer, cardsInHand, self.Player1Cards.length, 3 * (canvas_height / 4) + 100, number_of_cards, hidecards, orientationcoef);
            self.Player1Cards.push(temp);
            self.RenderGame();
        }
    }

    self.RenderGame = function () {
        stage.removeAllChildren();
        mmgamelogic.renderCards(self.Player1Cards, false);
        mmgamelogic.renderCards(self.Player2Cards, true);
    };

    self.isPlayer1Turn = false;

    self.goToNextTurn = function () {
        self.Turn += 1;
        self.isPlayer1Turn = !self.isPlayer1Turn;
    };

    return self;
};
