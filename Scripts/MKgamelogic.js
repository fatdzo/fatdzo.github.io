"use strict";
var mmgamelogic = mmgamelogic || {};

angular.module("mmgame", [])
.controller("mmgamecontroller", function ($scope) {
    $scope.Game = new mmviewmodel.GameViewModel();
    loadGame();
});

function drawCard(card, x, y, hidecard) {
    card.CardBitmap.x = x;
    card.CardBitmap.y = y;
    stage.addChild(card.CardBitmap);

    if (!card.Hide) {
        stage.addChild(card.DEFText);
        stage.addChild(card.DMGText);

    }
}

function createCardDMG(x, y, dmg, color) {
    if (dmg != null) {
        var dmgx = calculateDMGTextX(x, dmg);
        var dmgy = calculateDMGTextY(y, dmg);

        var attText = createText(dmg, dmgx, dmgy, font_size + "px", color);
    }
    return attText;
}

function calculateDMGTextX(x, dmg) {
    if (dmg != null) {
        var dmgx = x + 10;
        //for 2 digit values
        if (dmg > 9) {
            dmgx = x;
        }
    }
    return dmgx;
}

function calculateDMGTextY(y, dmg) {
    var dmgy = y + font_size - 3;
    return dmgy;
}

function calculateDEFTextX(x, def) {
    if (def != null) {
        var defx = x + 70;
        //for 2 digit values
        if (def > 9) {
            defx = x + 60;
        }
        return defx;
    }
    return 0;
}

function calculateDEFTextY(y, def) {
    if (def != null) {
        var defy = y + card_height - 8;
        return defy;
    }
    return 0;
}

function createCardDEF(x, y, def, color) {
    if (def != null) {
        var defx = calculateDEFTextX(x, def);
        var defy = calculateDEFTextY(y, def);

        var defText = createText(def, defx, defy, font_size + "px", color);
        return defText;
    }
}
mmgamelogic.getStatColor = function (stat, basestat) {
    if (stat < basestat) {
        return color_card_stats_neg;
    }
    if (stat > basestat) {
        return color_card_stats_pos;
    }
    return color_card_stats;
};

mmgamelogic.updateDMGDEFText = function (resultCard) {
    
    if (resultCard.DEF > 0) {
        stage.removeChild(resultCard.DMGText);
        stage.removeChild(resultCard.DEFText);
        
        resultCard.DMGText = createCardDMG(resultCard.x, resultCard.y, resultCard.DMG, mmgamelogic.getStatColor(resultCard.DMG, resultCard.BaseDMG));
        resultCard.DEFText = createCardDEF(resultCard.x, resultCard.y, resultCard.DEF, mmgamelogic.getStatColor(resultCard.DEF, resultCard.BaseDEF));
        stage.addChild(resultCard.DMGText);
        stage.addChild(resultCard.DEFText);
    }
    else {
        mmgamelogic.removecardAnimation(resultCard);
    }
};

mmgamelogic.removecardAnimation = function (card) {
    var animtim = 1000;
    createjs.Tween.get(card.DMGText, { loop: false, override: true })
        .to({ alpha: 0 }, animtim, createjs.Ease.getPowInOut(4)).call(handleCompleteRemove);
    createjs.Tween.get(card.DEFText, { loop: false, override: true })
        .to({ alpha: 0 }, animtim, createjs.Ease.getPowInOut(4)).call(handleCompleteRemove);
    createjs.Tween.get(card.CardBitmap, { loop: false, override: true })
        .to({ alpha: 0 }, animtim, createjs.Ease.getPowInOut(4)).call(handleCompleteRemove);
    mmgamelogic.deSelectCardOnTableAnimation(card);
};

function handleCompleteRemove(event) {
    stage.removeChild(event.Target);
}

function createCard(belongstoplayer, card_type, handIndex, cardIndex, x, y, orientationcoef, dmg, def, hidecards) {
    var resultCard = new mmviewmodel.CardViewModel();
    resultCard.BelongsToPlayer = belongstoplayer;
    resultCard.BaseDEF = def;
    resultCard.BaseDMG = dmg;
    resultCard.DEF = def;
    resultCard.DMG = dmg;
    resultCard.Name = card_type;
    resultCard.TYPE = card_type;
    resultCard.x = x;
    resultCard.y = y;
    resultCard.OrientationCoef = orientationcoef;
    resultCard.Hide = hidecards;
    resultCard.HandIndex = handIndex;
    resultCard.CardIndex = cardIndex;

    console.log("Created: x->" + resultCard.x + "y->" + resultCard.y);
    var cardImage = getCardTypeImage(card_type);
    if (hidecards) {
        cardImage = cardbackImage;
    }
    resultCard.CardBitmap = new createjs.Bitmap(cardImage);
    resultCard.CardBitmap.x = resultCard.x;
    resultCard.CardBitmap.y = resultCard.y;

    resultCard.DMGText = createCardDMG(resultCard.x, resultCard.y, resultCard.DMG, color_card_stats);
    resultCard.DEFText = createCardDEF(resultCard.x, resultCard.y, resultCard.DEF, color_card_stats);

    resultCard.CardBitmap.addEventListener("click", function (event) {
        if (resultCard.Status == mmviewmodel.CardStatusEnum.OnTable) {
            if (resultCard.IsSelected) {
                mmgamelogic.deSelectCardOnTableAnimation(resultCard);
                resultCard.OpposingCardIndex = -1;
                resultCard.IsSelected = false;
            }
            else {
                angular.element($('#mmgamecontroller')).scope().$apply(function ($scope) {
                    mmgamelogic.selectCardOnTableAnimation(resultCard);
                    resultCard.IsSelected = true;

                    if (resultCard.BelongsToPlayer == $scope.Game.CurrentPlayer) {
                        $scope.Game.CurrentPlayerCardIndex = resultCard.CardIndex;
                        console.log("CurrentPlayerCardIndex -> " + resultCard.CardIndex);
                    }
                    else {
                        if ($scope.Game.CurrentPlayerCardIndex > 0) {
                            $scope.Game.getCurrentPlayerCards()[$scope.Game.CurrentPlayerCardIndex].OpposingCardIndex = resultCard.CardIndex;
                            console.log("Opposing index -> " + resultCard.CardIndex);
                        }
                    }

                });
            }
        }
        if (resultCard.Status == mmviewmodel.CardStatusEnum.InHand) {
            mmgamelogic.putcardOnTableAnimation(resultCard);
        }
        
    });

    resultCard.CardBitmap.addEventListener("mouseover", function (event) {
        angular.element($('#mmgamecontroller')).scope().$apply(function ($scope) {
            if (resultCard.Status == mmviewmodel.CardStatusEnum.InHand && $scope.Game.CurrentPlayer == resultCard.BelongsToPlayer) {
                mmgamelogic.selectCardInHandAnimation(resultCard);
            }
        });
    });

    resultCard.CardBitmap.addEventListener("mouseout", function (event) {
        angular.element($('#mmgamecontroller')).scope().$apply(function ($scope) {
            if (resultCard.Status == mmviewmodel.CardStatusEnum.InHand && $scope.Game.CurrentPlayer == resultCard.BelongsToPlayer) {
                mmgamelogic.deselectCardInHandAnimation(resultCard);
            }
        });

    });


    return resultCard;
}

mmgamelogic.calculateCardYValForPlayer = function (currentPlayer, cardstatus) {
    var yval = 0;
    
    if (currentPlayer == PLAYER_1 && cardstatus == mmviewmodel.CardStatusEnum.InHand) {
        yval = 3 * (canvas_height / 4) + 100;
    }
    if (currentPlayer == PLAYER_1 && cardstatus == mmviewmodel.CardStatusEnum.OnTable) {
        var yposition = 3 * (canvas_height / 4) + 100;
        yval = yposition - 1 * (card_height + card_distance_height);
    }
    if (currentPlayer == PLAYER_2 && cardstatus == mmviewmodel.CardStatusEnum.InHand) {
        yval = 0;
    }
    if (currentPlayer == PLAYER_2 && cardstatus == mmviewmodel.CardStatusEnum.OnTable) {
        yval = 1 * (card_height + card_distance_height);
    }
    console.log("NEW YVAL -> " + yval);
    return yval;
};

mmgamelogic.updateCardBitmap = function (newcardImage, card) {
    card.CardBitmap.image.src = newcardImage;
    card.CardBitmap.x = card.x;
    card.CardBitmap.y = card.y;

    card.DMGText = createCardDMG(card.x, card.y, card.DMG, color_card_stats);
    card.DEFText = createCardDEF(card.x, card.y, card.DEF, color_card_stats);
};

mmgamelogic.selectCardInHandAnimation = function (card) {
    var animtime = 300;
    var ydistance = card.OrientationCoef * 10;
    createjs.Tween.get(card.CardBitmap, { loop: false })
        .to({ y: card.y - ydistance }, animtime, createjs.Ease.getPowInOut(4));
    createjs.Tween.get(card.DMGText, { loop: false })
        .to({ y: calculateDMGTextY(card.y, card.DMG) - ydistance }, animtime, createjs.Ease.getPowInOut(4));
    createjs.Tween.get(card.DEFText, { loop: false })
        .to({ y: calculateDEFTextY(card.y, card.DMG) - ydistance }, animtime, createjs.Ease.getPowInOut(4));
};

mmgamelogic.deselectCardInHandAnimation = function (card) {
    var animtime = 300;
    createjs.Tween.get(card.CardBitmap, { loop: false })
        .to({ y: card.y }, animtime, createjs.Ease.getPowInOut(4));
    createjs.Tween.get(card.DMGText, { loop: false })
        .to({ y: calculateDMGTextY(card.y, card.DMG) }, animtime, createjs.Ease.getPowInOut(4));
    createjs.Tween.get(card.DEFText, { loop: false })
        .to({ y: calculateDEFTextY(card.y, card.DMG) }, animtime, createjs.Ease.getPowInOut(4));
};

mmgamelogic.moveCardsToTheLeftAnimation = function (playercards, yval, cardstatus) {
    var animtime = 1000;
    var currentHandIndex = -1;
    for (var i = 0; i < playercards.length; i++) {
        if (playercards[i].Status == cardstatus) {
            currentHandIndex += 1;
            mmgamelogic.moveCardToNewPosition(playercards[i], canvas_padding_left + (currentHandIndex) * (canvas_width / number_of_cards), yval);

            createjs.Tween.get(playercards[i].CardBitmap, { loop: false })
                  .to({ x: playercards[i].x }, animtime, createjs.Ease.getPowInOut(4));
            createjs.Tween.get(playercards[i].DMGText, { loop: false })
                  .to({ x: calculateDMGTextX(playercards[i].x, playercards[i].DMG) }, animtime, createjs.Ease.getPowInOut(4));
            createjs.Tween.get(playercards[i].DEFText, { loop: false })
                  .to({ x: calculateDEFTextX(playercards[i].x, playercards[i].DEF) }, animtime, createjs.Ease.getPowInOut(4));

            playercards[i].HandIndex = currentHandIndex;
            
        }
    }
};

mmgamelogic.putPlayerCardOnTableAnimation = function (playercards, selectedcard) {
    var animtime = 1000;
    playercards[selectedcard.CardIndex].Status = mmviewmodel.CardStatusEnum.OnTable;
    
    mmgamelogic.moveCardsToTheLeftAnimation(playercards, playercards[selectedcard.CardIndex].y, mmviewmodel.CardStatusEnum.InHand);

    if (selectedcard.Hide) {
        var cardImage = getCardTypeImage(selectedcard.TYPE);
        playercards[selectedcard.CardIndex].Hide = false;
        mmgamelogic.updateCardBitmap(cardImage, playercards[selectedcard.CardIndex]);
        stage.addChild(playercards[selectedcard.CardIndex].DMGText);
        stage.addChild(playercards[selectedcard.CardIndex].DEFText);
    }

    playercards[selectedcard.CardIndex].HandIndex = -1;

    var tableIndex = -1;
    for (var i = 0; i < playercards.length; i++) {
        if (playercards[i].Status == mmviewmodel.CardStatusEnum.OnTable) {
            tableIndex += 1;
        }
    }

    mmgamelogic.moveCardToNewPosition(playercards[selectedcard.CardIndex], canvas_padding_left + (tableIndex) * (canvas_width / number_of_cards), selectedcard.y - selectedcard.OrientationCoef * (card_height + card_distance_height));

    createjs.Tween.get(playercards[selectedcard.CardIndex].CardBitmap, { loop: false })
          .to({ x: playercards[selectedcard.CardIndex].x, y: playercards[selectedcard.CardIndex].y }, animtime, createjs.Ease.getPowInOut(4));
    createjs.Tween.get(playercards[selectedcard.CardIndex].DMGText, { loop: false })
          .to({ x: calculateDMGTextX(playercards[selectedcard.CardIndex].x, playercards[selectedcard.CardIndex].DMG), y: calculateDMGTextY(playercards[selectedcard.CardIndex].y, playercards[selectedcard.CardIndex].DMG) }, animtime, createjs.Ease.getPowInOut(4));
    createjs.Tween.get(playercards[selectedcard.CardIndex].DEFText, { loop: false })
          .to({ x: calculateDEFTextX(playercards[selectedcard.CardIndex].x, playercards[selectedcard.CardIndex].DEF), y: calculateDEFTextY(playercards[selectedcard.CardIndex].y, playercards[selectedcard.CardIndex].DEF) }, animtime, createjs.Ease.getPowInOut(4));

    playercards[selectedcard.CardIndex].Status = mmviewmodel.CardStatusEnum.OnTable;
    playercards[selectedcard.CardIndex].TableIndex = tableIndex;
};

mmgamelogic.selectCardOnTableAnimation = function (card) {
    var shape = new createjs.Shape();
    shape.graphics.beginStroke("#ff0000").drawRect(card.x - 2, card.y - 2, card_width + 4, card_height + 4);
    card.OutlineShape = shape;

    stage.addChild(card.OutlineShape);
};

mmgamelogic.deSelectCardOnTableAnimation = function (card) {
    stage.removeChild(card.OutlineShape);
};

mmgamelogic.deselectPlayerCardsOnTable = function (playercards) {
    for (var i = 0; i < playercards.length; i++) {
        if (playercards[i].IsSelected && playercards[i].Status == mmviewmodel.CardStatusEnum.OnTable) {
            playercards[i].IsSelected = false;
            mmgamelogic.deSelectCardOnTableAnimation(playercards[i]);
        }
    }
};

mmgamelogic.putcardOnTableAnimation = function (card) {
    angular.element($('#mmgamecontroller')).scope().$apply(function ($scope) {
        if (!$scope.Game.hasMaxCarsPlayed()) {
            if ($scope.Game.CurrentPlayer == PLAYER_1 && card.BelongsToPlayer == PLAYER_1) {
                if (mmviewmodel.numberOfCardsOnTable($scope.Game.Player1.PlayerCards) < max_num_of_cards_on_table) {
                    mmgamelogic.putPlayerCardOnTableAnimation($scope.Game.Player1.PlayerCards, card);
                    $scope.Game.CardsPlayed += 1;
                }
            }
            if ($scope.Game.CurrentPlayer == PLAYER_2 && card.BelongsToPlayer == PLAYER_2) {
                if (mmviewmodel.numberOfCardsOnTable($scope.Game.Player2.PlayerCards) < max_num_of_cards_on_table) {
                    mmgamelogic.putPlayerCardOnTableAnimation($scope.Game.Player2.PlayerCards, card);
                    $scope.Game.CardsPlayed += 1;
                }
            }
        }
    });

    //.to({ alpha: 0, y: 175 }, 500, createjs.Ease.getPowInOut(2))
    //.to({ alpha: 0, y: 225 }, 100)
    //.to({ alpha: 1, y: 200 }, 500, createjs.Ease.getPowInOut(2))
    //.to({ x: 100 }, 800, createjs.Ease.getPowInOut(2));
};

mmgamelogic.renderCards = function (cardarray, hidecards) {
    for (var i = 0; i < cardarray.length; i++) {
        drawCard(cardarray[i], cardarray[i].x, cardarray[i].y, hidecards);
    }
};

function getCardTypeImage(card_type) {

    if (card_type == mmviewmodel.CardTypeEnum.Earth) {
        return earthcardImage;
    }
    if (card_type == mmviewmodel.CardTypeEnum.Fire) {
        return firecardImage;
    }
    if (card_type == mmviewmodel.CardTypeEnum.Water) {
        return watercardImage;
    }
    if (card_type == mmviewmodel.CardTypeEnum.Wind) {
        return windcardImage;
    }

    return cardbackImage;
}

function createText(inputstring, x, y, size, color) {
    var text = new createjs.Text(inputstring, size + " " + "Arial", color);
    text.x = x;
    text.y = y;
    text.textBaseline = "alphabetic";
    return text;
}

function loadGame() {
    stage = new createjs.Stage("mmgamecanvas");
    stage.enableMouseOver();

    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", stage);
}

mmgamelogic.populateCards = function (belongstoplayer, numberOfCards, yval, hidecards, orientationcoef) {
    var resultCards = [];
    for (var i = 0; i < numberOfCards; i++) {
        var temp = mmgamelogic.createRandomCard(belongstoplayer, i, i, yval, hidecards,orientationcoef);
        resultCards.push(temp);
    }
    return resultCards;
};

mmgamelogic.createRandomCard = function (belongstoplayer, handindex, cardindex, yval, hidecards, orientationcoef) {
    var typecard = Math.floor(10 + (Math.random() * 4));
    var damage = Math.floor(Math.random() * 10 + 1);
    var defense = Math.floor(Math.random() * 10 + 1);
    var temp = createCard(belongstoplayer, typecard, handindex, cardindex, canvas_padding_left + handindex * (canvas_width / max_num_of_cards_in_hand), yval, orientationcoef, damage, defense, hidecards);
    temp.Status = mmviewmodel.CardStatusEnum.InHand;
    return temp;
};

mmgamelogic.moveCardToNewPosition = function (card, newXValue, newYValue) {
    card.x = newXValue;
    card.y = newYValue;
};

