pos_def = [
    /* First element: Which column on the X-axis
     * Second element: Which row on the Y-axis
     * Third element: shift factor. How much should the Y-Axis (half height) shiftet.
     * Counting starts at 0.
     */

    [0, 0, 0],
    [0, 1, 0],
    [0, 2, 0],

    [1, 0, 1],
    [1, 1, 1],
    [1, 2, 1],
    [1, 3, 1],

    [2, 0, 2],
    [2, 1, 2],
    [2, 2, 2],
    [2, 3, 2],
    [2, 4, 2],

    [3, 0, 1],
    [3, 1, 1],
    [3, 2, 1],
    [3, 3, 1],

    [4, 0, 0],
    [4, 1, 0],
    [4, 2, 0]
];


function gen_tile(radius, h_color, d_color, u_color) {
    var hexagon = new createjs.Shape();
    hexagon.graphics.beginFill("black").beginStroke("black").drawPolyStar(0, 0, radius, 6, 0, 0);
    hexagon.alpha = 0.9;
    hexagon.x = hexagon.y = 0;

    var inner = radius * (Math.sqrt(3) / 2);
    var bar_height = inner * 2;
    var bar_width = radius / 3;

    var h_bar = gen_bar(h_color, bar_width, bar_height);
    h_bar.x -= (bar_width / 2);
    h_bar.y -= (bar_height / 2);

    var d_bar = gen_bar(d_color, bar_width, bar_height);
    d_bar.regX = bar_width / 2;
    d_bar.regY = bar_height / 2;
    d_bar.rotation = 60;

    var u_bar = gen_bar(u_color, bar_width, bar_height);
    u_bar.regX = bar_width / 2.0;
    u_bar.regY = bar_height / 2.0;
    u_bar.rotation = 120;

    var tile = new createjs.Container();
    tile.addChild(hexagon, u_bar, d_bar, h_bar);

    tile.h_color = h_color;
    tile.d_color = d_color;
    tile.u_color = u_color;

    return tile;
}


function gen_bar(color, bar_width, bar_height) {
    var bar = new createjs.Shape();
    bar.graphics.beginFill(color).rect(0, 0, bar_width, bar_height);
    bar.x = bar.y = 0;
    return bar;
}


function intersect(grid, radius, ob2_x, ob2_y) {
  for (let i=0; i < 19; ++i) {
    var x = grid[i][0];
    var y = grid[i][1];

    var xsq = Math.pow(ob2_x - x, 2);
    var ysq = Math.pow(ob2_y - y, 2);
    var distance = Math.sqrt(xsq + ysq);
    if (distance < radius) {
      return [i, x, y];
    }
  }
  return false;
}


function cal_point_pos(stones_by_pos, positions, direction) {
    var color_to_points = {
        "h_color": {
            "grey": 1,
            "cyan": 5,
            "yellow": 9
        },
        "d_color": {
            "violet": 3,
            "blue": 4,
            "orange": 8
        },
        "u_color": {
            "pink": 2,
            "red": 6,
            "green": 7
        }
    };

    for (var color in color_to_points[direction]) {
        var count = 0;
        for (var i=0; i<positions.length; ++i) {
            if (stones_by_pos[positions[i]][direction] == color) {
                count += 1;
            }
        }

        if (count == positions.length) {
            return count * color_to_points[direction][color];
        }
    }

    return 0;
}

function calc_points(stones_by_pos) {
    var point_pos_h = [
        [0, 1, 2],
        [3, 4, 5, 6],
        [7, 8, 9, 10, 11],
        [12, 13, 14, 15],
        [16, 17, 18]
    ];

    var point_pos_d = [
        [0, 3, 7],
        [1, 4, 8, 12],
        [2, 5, 9, 13, 16],
        [6, 10, 14, 17],
        [11, 15, 18]

    ];

    var point_pos_u = [
        [7, 12, 16],
        [3, 8, 13, 17],
        [0, 4, 9, 14, 18],
        [1, 5, 10, 15],
        [2, 6, 11]
    ];

    var count = 0;
    point_pos_h.forEach(function (positions) {
        count += cal_point_pos(stones_by_pos, positions, "h_color");
    });

    point_pos_d.forEach(function (positions) {
        count += cal_point_pos(stones_by_pos, positions, "d_color");
    });

    point_pos_u.forEach(function (positions) {
        count += cal_point_pos(stones_by_pos, positions, "u_color");
    });

    $("#result").text(count);
}


function gen_random_game(stones) {
    var stone_ids = Object.keys(stones);
    var result = [];

    for (var i=0; i < 19; ++i) {
        var index = Math.floor(Math.random() * stone_ids.length);
        result.push(stone_ids.splice(index, 1)[0]);
    }

    return result;
}

function gen_grid_pos(radius) {
    var inner = radius * (Math.sqrt(3) / 2);

    var x = radius;
    var y = 80 + (inner * 3);

    var bar_height = inner * 2;

    var grid = [];
    for (var i=0; i < 19; ++i) {
        var pos = pos_def[i];
        grid.push([
            x + (pos[0] * (2 * radius)) - (pos[0] *  (radius / 2)),
            y + (pos[1] * bar_height) - (pos[2] * inner)
        ]);
    }

    return grid;
}

function render_grid(stage, grid, radius) {
    for (var i=0; i < 19; ++i) {
        var item = new createjs.Shape();
        item.graphics.beginStroke("black").drawPolyStar(0, 0, radius, 6, 0, 0);
        item.x = grid[i][0];
        item.y = grid[i][1];
        stage.addChild(item);
    }
}

function generate_stone_tiles(radius) {
    var stones = {};
    
    for (let h_color of ["grey", "cyan", "yellow"]) {
        for (let d_color of ["violet", "blue", "orange"]) {
            for (let u_color of ["pink", "red", "green"]) {
                var stone = gen_tile(radius, h_color, d_color, u_color);
                stones[[h_color, d_color, u_color]] =  stone;
            }
        }
    }

    return stones;
}

function make_stones_interactive(stage, grid, radius, stones, stones_by_pos) {
    for (var stone_id in stones) {
        var stone = stones[stone_id];

        stone.on("pressmove", function(ev) {
            ev.currentTarget.x = ev.stageX;
            ev.currentTarget.y = ev.stageY;
            stage.update();
        });

        stone.on("pressup", function(ev) {
            var pos = intersect(grid, radius, ev.stageX, ev.stageY);
            if (pos != false) {
                stones_by_pos[pos[0]] = ev.currentTarget;

                ev.currentTarget.x = pos[1];
                ev.currentTarget.y = pos[2];
                stage.update();
            }
        });
    }
}


function init() {
    var body_margin = 2;

    /* This is the entire space we have. */
    var w = $(window).width() - (body_margin * 2);

    /* Lets use the entire width for the tile canvas. */
    $("#demoCanvas").attr('width', w);

    /* Calc the size of a single tile. Assuming vertical phone */
    var radius = Math.floor(w / 8.0);

    /* Use only as much 'height' as wee need for the tiles. */
    var h = 90 + (10 * radius * (Math.sqrt(3) / 2));
    $("#demoCanvas").attr('height', h);

    var grid = gen_grid_pos(radius);

    var stones = generate_stone_tiles(radius);
    var stones_by_pos = {};

    var stage = new createjs.Stage("demoCanvas");
    createjs.Touch.enable(stage);

    make_stones_interactive(stage, grid, radius, stones, stones_by_pos);
    render_grid(stage, grid, radius);
    stage.update();

    var current_game = gen_random_game(stones);

    $("#next_stone").click(function() {
        var stone_cfg = current_game.pop();
        var stone = stones[stone_cfg];
        stone.x = radius;
        stone.y = 85 + (9 * radius * (Math.sqrt(3) / 2));
        stage.addChild(stone);
        stage.update();
    });

    $("#calc_points").click(function() {
        calc_points(stones_by_pos);
    });
}
