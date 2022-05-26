"use strict";


(function() {
    
    // Adding the players id
    const Player = function(id) {
        this.id = id;
        this.position = {
            x: 0,
            y: 0
        };
        this.life = 100;
        this.weapon = weapons[Math.floor(Math.random() * weapons.length)];
        this.action = "null";
        this.damagePower = function() {
            return (this.weapon ? this.weapon.damage : 0);
        }
    }

    const player1 = new Player("player1");
    const player2 = new Player("player2");
    var activePlayer

    function generateRandomPosition() {
        return [Math.floor(Math.random() * gridCount), Math.floor(Math.random() * gridCount)];
    }

    
    // adding the blocks in the field ,the area is available random place.
    function deployBlocks() {
        let i = 0;
        while (i < blockCount) {
            let position = generateRandomPosition();
            let grid = gridByPosition(position);
            if (!grid.hasClass("unavailable")) {
                grid.addClass("unavailable block");
                i++;
            }
        }
    }

    function setUnavailable(position) {
        gridByPosition(position).addClass("unavailable");
    }

    function gridByPosition(position) {
        return $("[data-x='" + position[0] + "'][data-y='" + position[1] + "']");
    }

    //Deploying the weapons in random positions

    function deployWeapons() {
        weapons.forEach(function(weapon) {
            let placed = false;

            while (!placed) {
                let position = generateRandomPosition();
                let grid = gridByPosition(position);
                if (!grid.hasClass("unavailable")) {
                    grid.addClass("weapons " + weapon.className);
                    grid.attr("weapon", weapon.name)
                    placed = true
                }
            }
        });

    }

    // deploying the players in random positions
    function deployPlayers() {
        let position1 = generateRandomPosition();
        let position2 = generateRandomPosition();
        player1.position = { x: position1[0], y: position1[1] };
        player2.position = { x: position2[0], y: position2[1] };
        //   setUnavailable(position1)
        gridByPosition(position1).addClass("unavailable player1")
        gridByPosition(position2).addClass("unavailable player2")
        showPlayersLife();
        showPlayerWeapon(player1);
        showPlayerWeapon(player2);
    }

    //Show players Life 

    function showPlayersLife() {
        $(".player1-life").html(Math.max(player1.life, 0));
        $(".player2-life").html(Math.max(player2.life, 0));

        if (player1.life <= 0) {
            resetBattleField();
            setTimeout(function() {
                if (confirm("Player2 wins! \n Do u want to continue?")) {
                    location.reload();
                }
            }, 100);


        } else if (player2.life <= 0) {
            resetBattleField();

            setTimeout(function() {
                if (confirm("Player1 wins! \n Do u want to continue?")) {
                    location.reload();
                }
            }, 100);

        }
    }

    function resetBattleField() {
        $('.grid-item').remove();
        $('#start-game').remove();

    }

    function resetAll() {
        $('.grid-item').removeClass().addClass("grid-item");
    }

    function setActivePlayer(player) {
        removeHighlightPath();

        activePlayer = player;
        $('.active-player').removeClass('active-player');
        $("." + activePlayer.id + "-content").addClass("active-player");
        if (adjacentPlayers()) {
            showActionButtons();
            //activePlayer.highlightPath();

        }
        highlightPath();

    }


    function removeHighlightPath() {
        $('.highlight').off("click")
        $('.grid-item').removeClass("highlight");
    }


    function highlightPath() {
        let currentX = activePlayer.position.x;
        let currentY = activePlayer.position.y;

        //   check left side 
        let leftCount = 1;
        while (currentX - leftCount >= 0) {
            let block = $('[data-x=' + (currentX - leftCount) + '][data-y=' + currentY + ']')
            if (block.hasClass('unavailable'))
                break;
            else {
                block.addClass("highlight");
            }

            leftCount++;
       
            if (leftCount > 3) {
                break;
            }
        }

        //   check top side
        let topCount = 1;
        while (currentY - topCount >= 0) {
            let block = $('[data-x=' + (currentX) + '][data-y=' + (currentY - topCount) + ']')
            if (block.hasClass('unavailable'))
                break;
            else {
                block.addClass("highlight")
            }

            topCount++;
            if (topCount > 3) {
                break;
            }
        }

        //   check right side 
        let rightCount = 1;
        while (currentX + rightCount < gridCount) {
            let block = $('[data-x=' + (currentX + rightCount) + '][data-y=' + currentY + ']')
            if (block.hasClass('unavailable'))
                break;
            else {
                block.addClass("highlight")
            }

            rightCount++;
            if (rightCount > 3) {
                break;
            }
        }

        //   check bottom side 
        let bottomCount = 1;
        while (currentY + bottomCount >= 0) {
            let block = $('[data-x=' + (currentX) + '][data-y=' + (currentY + bottomCount) + ']')
            if (block.hasClass('unavailable'))
                break;
            else {
                block.addClass("highlight")
            }

            bottomCount++;
            if (bottomCount > 3) {
                break;
            }
        }

        handleClickonHighlight();
    }

    
    function showPlayerWeapon(player) {
       
        $("#" + player.id + "-weapon").addClass(player.weapon.className);
    }


    function RemoveWeapon(player)
    { 
        var lastClass = $("#" + player.id + "-weapon").attr('class').split(' ').pop();
        $("#" + player.id + "-weapon").removeClass(lastClass);
    }

    function handleClickonHighlight() {
        $('.highlight').on("click", function() {
            if (!$(this).hasClass("highlight")) {
                
                return;
            }
            resetPlayerOldPosition(activePlayer);
            let clickedPosition = [$(this).data("x"), $(this).data("y")]
            moveActivePlayerTo(clickedPosition);
            if (adjacentPlayers()) {
                handleAdjacentPlayers();
                return;
            }

            let weapon = hasWeapon($(this))
            if (weapon) {
                activePlayer.weapon = weapon;
                RemoveWeapon(activePlayer);
                showPlayerWeapon(activePlayer);

            }

            hideActionButtons();
            setActivePlayer(nextPlayer());

        })
    }

    function handleAdjacentPlayers() {
        showActionButtons();
        console.log("Players are neck to neck !!");

    }


    function showActionButtons() {
        hideActionButtons();
        console.log("." + activePlayer.id + "-buttons ");
        $("." + activePlayer.id + "-buttons ").removeClass("hidden");

    }

    function hideActionButtons() {
        $(".player-buttons").addClass("hidden");

    }

    function hasWeapon(grid) {
        if (grid.hasClass("weapons") && grid.attr("weapon")) {
            console.log(grid.hasClass("weapons"), grid.attr("weapon"), weapons.find(function(x) { return x.name == grid.attr("weapon") }));
            return weapons.find(function(x) { return x.name == grid.attr("weapon") });
        } else {
            return null;
        }
    }

    function adjacentPlayers() {
        console.log(player1.position);
        console.log(player2.position);
        let p1X = player1.position.x;
        let p1Y = player1.position.y;
        let p2X = player2.position.x;
        let p2Y = player2.position.y;
        if ((p1X == p2X && Math.abs(p1Y - p2Y) == 1) || (p1Y == p2Y && Math.abs(p1X - p2X) == 1)) {
            console.log("Adjacent WARRRR");
            return true;
        } else {
            console.log("Go on !! keep playing!!");
            return false;
        }
    }

    function moveActivePlayerTo(position) {
        activePlayer.position.x = position[0];
        activePlayer.position.y = position[1];

        gridByPosition(position).addClass("unavailable " + activePlayer.id);
    }

    function resetPlayerOldPosition(player) {
        gridByPosition([activePlayer.position.x, activePlayer.position.y]).removeClass("unavailable")
        $('.highlight').removeClass("highlight")
        $('.grid-item').removeClass(activePlayer.id)
    }

    function nextPlayer() {
        return (activePlayer.id == player1.id ? player2 : player1);
    }

    // initiating Game!!
    generateGrid();
    $('#start-game').click(function() {
        resetAll();
        deployPlayers();
        deployBlocks();
        // weapon1();
        deployWeapons();
        setActivePlayer(player1);

    })

    $('#attack1').click(function() {
        attacking(player1);
        setActivePlayer(player2);
    });
    $('#attack2').click(function() {
        attacking(player2);
        setActivePlayer(player1);
    });
    $('#defend1').click(function() {
        defending(player1);
        setActivePlayer(player2);
    });
    $('#defend2').click(function() {
        defending(player2);
        setActivePlayer(player1);
    });
    
    function attacking(player) {
        player.action = "attack";
        updateResult();
    }

    function defending(player) {
        player.action = "defend";
        updateResult();
    }

    function updateResult() {
        console.log(player1.action, player2.action)
        if (player1.action && player2.action &&  (player1.damagePower() > 0 || player2.damagePower() > 0)) 
        {
        
                if (player1.action == "attack" && player2.action=="null")
                {
                    console.log("P1-A")
                    player2.life = player2.life - player1.damagePower();                    
                    player1.action = "null";
                    player2.action = "null";
                }
                
                else if(player2.action == "attack" && player1.action=="null")
                {
                    console.log("P2-A")
                    player1.life = player1.life - player2.damagePower();
                    
                    player1.action = "null";
                    player2.action = "null";
                } 
        
                else if (player1.action == "attack" && player2.action == "defend" )
                    {
                        console.log("P1-A P2-D")
                        player2.life = player2.life - (player1.damagePower() / 2);
                        
                       player1.action = "null";
                       player2.action = "null";
                    }
                
                else if (player1.action == "defend" && player2.action == "attack" )
                  {
                        console.log("P1-D P2-A")
    
                        player1.life = player1.life - (player2.damagePower() / 2);                        
                        player1.action = "null";
                        player2.action = "null";
                    } 

                 else if (player1.action == "defend" && player2.action == "defend" )
                 {
                    console.log("P1-D P2-D")

                    player1.action = "null";
                    player2.action = "null";
                 }   
                
                 else
                 {
                    console.log(">>>>>>>>>")

                 }
            
            showPlayersLife();



        }

    }

})()