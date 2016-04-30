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
    self.OutlineShape = null;
    self.IsSelected = false;
    self.Hide = false;
    self.Status = mmviewmodel.CardStatusEnum.InDeck;
    self.HandIndex = 0;
    self.TableIndex = -1;
    self.CardIndex = 0;
    self.OpposingCardIndex = -1;
};

mmviewmodel.PlayerViewModel = function () {
    var self = this;
    self.Name = "Uknown King";
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
    self.PlayerCards = [];

    self.calculatePlayerDamageType = function (cardtype) {
        var calcdmg = 0;
        for (var i = 0; i < self.PlayerCards.length; i++){
            if (self.PlayerCards[i].OpposingCardIndex == -1 && self.PlayerCards[i].IsSelected && self.PlayerCards[i].Status == mmviewmodel.CardStatusEnum.OnTable && self.PlayerCards[i].TYPE == cardtype){
                calcdmg += self.PlayerCards[i].DMG;
            }
        }
        return calcdmg;
    };

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
    self.Name = "Moruthro's Knights";
    self.MaxNumberOfCards = 5;
    self.Player1 = new mmviewmodel.PlayerViewModel();
    self.Player2 = new mmviewmodel.PlayerViewModel();
    self.Player2.PlayerCards = [];
    self.Turn = 1;
    self.CurrentPlayer = -1;
    self.CardsPlayed = 0;
    self.CardsDrawn = 0;
    self.NumberOfAttacks = 0;
    self.GameInProgress = false;
    self.GameStart = function () {
        self.Turn = 1;
        self.GameInProgress = true;
        var playerStart = Math.floor(1 + (Math.random() * 2));
        self.CurrentPlayer = playerStart;
        self.Player1.PlayerCards = [];
        var generatedPl1Cards = mmgamelogic.populateCards(PLAYER_1, start_num_of_cards_in_hand, mmgamelogic.getCardYValForPlayer(PLAYER_1), false, 1);
        self.Player1.PlayerCards = self.Player1.PlayerCards.concat(generatedPl1Cards);

        self.Player2.PlayerCards = [];
        self.Player2.PlayerCards = self.Player2.PlayerCards.concat(mmgamelogic.populateCards(PLAYER_2, start_num_of_cards_in_hand, mmgamelogic.getCardYValForPlayer(PLAYER_2), true, -1));

        mmgamelogic.renderCards(self.Player1.PlayerCards, false);
        mmgamelogic.renderCards(self.Player2.PlayerCards, true);
    };
    self.canStartGame = function () {
        if (!self.Player1.canSpendPoints() && !self.GameInProgress) {
            return false;
        }
        return true;
    }
    self.getCurrentPlayerCards = function () {
        if (self.CurrentPlayer == PLAYER_1) {
            return self.Player1.PlayerCards;
        }
        return self.Player2.PlayerCards;
    };

    self.getOpposingPlayer = function () {
        if (self.CurrentPlayer == PLAYER_1) {
            return self.Player2;
        }
        return self.Player1;
    };


    self.getCurrentPlayer = function () {
        if (self.CurrentPlayer == PLAYER_1) {
            return self.Player1;
        }
        return self.Player2;
    };

    self.hasMaxCarsPlayed = function () {
        var cardsOnTable = mmviewmodel.numberOfCardsOnTable(self.getCurrentPlayerCards());

        if (self.CardsPlayed < max_cards_played_turn && cardsOnTable < max_num_of_cards_on_table) {
            return false;
        }
        return true;
    };

    self.hasMaxCardsDrawn = function () {
        var cardsInHand = mmviewmodel.numberOfCardsInHand(self.getCurrentPlayerCards());
        
        if (cardsInHand < max_num_of_cards_in_hand && self.CardsDrawn < max_cards_draw && self.GameInProgress) {
            return false;
        }
        return true;
    }

    self.DrawCard = function () {
        var cardsInHand = mmviewmodel.numberOfCardsInHand(self.getCurrentPlayerCards());
        if (cardsInHand < max_num_of_cards_in_hand && self.CardsDrawn < max_cards_draw) {
            var orientationcoef = 1;
            var belongsToPlayer = 1;
            var hidecards = false;

            if (self.CurrentPlayer == PLAYER_2) {
                orientationcoef = -1;
                belongsToPlayer = 2;
                hidecards = true;
            }

            var temp = mmgamelogic.createRandomCard(belongsToPlayer,
                                                    cardsInHand,
                                                    self.getCurrentPlayerCards().length,
                                                    mmgamelogic.getCardYValForPlayer(self.CurrentPlayer),
                                                    hidecards,
                                                    orientationcoef);
            self.getCurrentPlayerCards().push(temp);
            self.RenderGame();

            self.CardsDrawn += 1;
        }
    }
    self.attack = function () {
        if (self.NumberOfAttacks < max_number_of_attacks) {
            var damageToOpposingPlayer = 0;

            var fireDamage = self.getCurrentPlayer().calculatePlayerDamageType(mmviewmodel.CardTypeEnum.Fire);
            var earthDamage = self.getCurrentPlayer().calculatePlayerDamageType(mmviewmodel.CardTypeEnum.Earth);
            var waterDamage = self.getCurrentPlayer().calculatePlayerDamageType(mmviewmodel.CardTypeEnum.Water);
            var windDamage = self.getCurrentPlayer().calculatePlayerDamageType(mmviewmodel.CardTypeEnum.Wind);

            var fireRes = self.getOpposingPlayer().calculateFire();
            var totfireDamage = 0;
            if (fireDamage > 0) {
                totfireDamage = fireDamage - self.getOpposingPlayer().calculateFire();
            }
            var earthRes = self.getOpposingPlayer().calculateEarth();
            var totearthDamage = 0;
            if (earthDamage > 0) {
                totearthDamage = earthDamage - self.getOpposingPlayer().calculateEarth();
            }
            var waterRes = self.getOpposingPlayer().calculateWater();
            var totwaterDamage = 0;
            if (waterDamage > 0) {
                totwaterDamage = waterDamage - self.getOpposingPlayer().calculateWater();
            }
            var windRes = self.getOpposingPlayer().calculateWind();
            var totwindDamage = 0;
            if (windDamage > 0) {
                totwindDamage = windDamage - self.getOpposingPlayer().calculateWind();
            }

            damageToOpposingPlayer = totfireDamage + totearthDamage + totwaterDamage + totwindDamage;
            console.log("F- " + totfireDamage + ";E- " + totearthDamage + ";W- " + totwaterDamage + ";WI- " + totwindDamage);
            self.getOpposingPlayer().CurrentHP -= damageToOpposingPlayer;
            self.NumberOfAttacks += 1;

            mmgamelogic.deselectPlayerCardsOnTable(self.getCurrentPlayerCards());
            mmgamelogic.deselectPlayerCardsOnTable(self.getOpposingPlayer().PlayerCards);
        }
    };
    self.CanAttack = function () {
        if (self.NumberOfAttacks < max_number_of_attacks && self.GameInProgress && mmviewmodel.numberOfCardsOnTable(self.getCurrentPlayerCards()) > 0) {
            return false;
        }
        return true;
    };

    self.RenderGame = function () {
        stage.removeAllChildren();
        mmgamelogic.renderCards(self.Player1.PlayerCards, false);
        mmgamelogic.renderCards(self.Player2.PlayerCards, true);
    };

    self.endTurn = function () {
        self.goToNextTurn();

        mmgamelogic.deselectPlayerCardsOnTable(self.getCurrentPlayerCards());
        mmgamelogic.deselectPlayerCardsOnTable(self.getOpposingPlayer().PlayerCards);
    };

    self.goToNextTurn = function () {
        self.Turn += 1;
        self.CardsPlayed = 0;
        self.CardsDrawn = 0;
        self.NumberOfAttacks = 0;
        if (self.CurrentPlayer == PLAYER_1) {
            self.CurrentPlayer = PLAYER_2;
        }
        else {
            self.CurrentPlayer = PLAYER_1;
        }

    };

    return self;
};
