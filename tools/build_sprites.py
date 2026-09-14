#!/usr/bin/env python3
"""Hand-author recognizable voxel sprites for Loopdrop. Outputs JS fragment."""
import json

# Palette indices matching COLORS in game.js (0-9 candy)
# 0 red 1 pink 2 orange 3 yellow 4 green 5 blue 6 purple 7 brown 8 cyan 9 cream

def S(name, lines, cmap=None):
    """lines: list of equal-length strings. chars map via cmap."""
    default = {
        '.': -1, ' ': -1,
        'R': 0, 'P': 1, 'O': 2, 'Y': 3, 'G': 4, 'B': 5, 'U': 6, 'N': 7, 'C': 8, 'W': 9,
        '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
        'K': 7,  # dark / outline (brown)
        'D': 7,
    }
    if cmap:
        default.update(cmap)
    h = len(lines)
    w = len(lines[0])
    assert all(len(L) == w for L in lines), name
    grid = []
    for L in lines:
        for ch in L:
            grid.append(default[ch])
    filled = sum(1 for v in grid if v >= 0)
    colors = len({v for v in grid if v >= 0})
    assert 30 <= filled <= 180, f'{name}: filled={filled}'
    assert 2 <= colors <= 5, f'{name}: colors={colors}'
    assert 12 <= w <= 20 and 12 <= h <= 22, f'{name}: {w}x{h}'
    return {'name': name, 'w': w, 'h': h, 'grid': grid, '_filled': filled, '_colors': colors}


SPRITES = []

# 1 Rubber duck — classic yellow body, orange beak
SPRITES.append(S('rubber_duck', [
    '................',
    '......YYYY......',
    '.....YYYYYY.....',
    '....YYYYYYYY....',
    '....YYYKYYYY....',
    '....YYYYYYYY....',
    '...OOOOYYYYYY...',
    '..YYYYYYYYYYYY..',
    '.YYYYYYYYYYYYYY.',
    '.YYYYYYYYYYYYYY.',
    '..YYYYYYYYYYYY..',
    '...YYYYYYYYYY...',
    '....YYYYYYYY....',
    '.....YYYYYY.....',
    '......YYYY......',
    '................',
]))

# 2 Cat face
SPRITES.append(S('cat_face', [
    '................',
    '..OO........OO..',
    '.OOOO......OOOO.',
    '.OOOOOOOOOOOOOO.',
    '.OOOOOOOOOOOOOO.',
    '.OOOKKOOOOOKKOO.',
    '.OOOWWOOOOWWOOO.',
    '.OOOOOOOOOOOOOO.',
    '.OOOOOPPOOOOOOO.',
    '.OOOOOOOOOOOOOO.',
    '..OOOOOOOOOOOO..',
    '...OOOOOOOOOO...',
    '....OOOOOOOO....',
    '................',
]))

# 3 Dog face
SPRITES.append(S('dog_face', [
    '................',
    '.NN..........NN.',
    '.NNNNNNNNNNNNNN.',
    '.NNNNNNNNNNNNNN.',
    '.NNNBBBBNNBBBNN.',
    '.NNNWWWNNNWWWNN.',
    '.NNNNNNNNNNNNNN.',
    '.NNNNNNPPNNNNNN.',
    '.NNNNNNNNNNNNNN.',
    '..NNNNNNNNNNNN..',
    '...NNNNNNNNNN...',
    '....NNNNNNNN....',
    '.....NNNNNN.....',
    '................',
]))

# 4 Owl
SPRITES.append(S('owl', [
    '................',
    '.....NNNNNN.....',
    '....NNNNNNNN....',
    '...NNWWWWWWWNN..',
    '..NNWWKKKKWWNN..',
    '..NNWWKKKKWWNN..',
    '..NNWWWWWWWWNN..',
    '...NNNNYYNNNN...',
    '....NNNNNNNN....',
    '....NNYYYYNN....',
    '...NNYYYYYYNN...',
    '..NNYYYYYYYYNN..',
    '...NNNNNNNNNN...',
    '....NNNNNNNN....',
    '................',
]))

# 5 Fish
SPRITES.append(S('fish', [
    '................',
    '................',
    '....OOOO........',
    '...OOOOOO...OO..',
    '..OOOOOOOO.OOOO.',
    '.OOOOOKOOOOOOOO.',
    '.OOOOOOOOOOOOOO.',
    '..OOOOOOOO.OOOO.',
    '...OOOOOO...OO..',
    '....OOOO........',
    '................',
    '................',
    '................',
    '................',
]))

# 6 Frog
SPRITES.append(S('frog', [
    '................',
    '..GG........GG..',
    '.GGGG......GGGG.',
    '.GGWWGGGGGGWWGG.',
    '.GGKKGGGGGGKKGG.',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGYYGGGGGG.',
    '..GGGGGGGGGGGG..',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '...GG......GG...',
    '..GG........GG..',
    '................',
    '................',
]))

# 7 Turtle
SPRITES.append(S('turtle', [
    '................',
    '......GGGG......',
    '.....GGGGGG.....',
    '....GGYYYYGG....',
    '...GGYYYYYYGG...',
    '..GGYYGGYYGGGG..',
    '.GGYYYGGYYYGGG..',
    '.GGYYYYYYYYGGG..',
    '..GGYYYYYYGGGG..',
    '...GGYYYYGGGG...',
    '....GGGGGGGG....',
    '...GG......GG...',
    '..GG........GG..',
    '................',
]))

# 8 Butterfly
SPRITES.append(S('butterfly', [
    '................',
    '.PPPP......UUUU.',
    '.PPPPP....UUUUU.',
    '.PPPPPP..UUUUUU.',
    '..PPPPPYYUUUUU..',
    '...PPPPYYUUUU...',
    '....PPPYYUUU....',
    '.....PPYYUU.....',
    '....PPPYYUUU....',
    '...PPPPYYUUUU...',
    '..PPPPPYYUUUUU..',
    '.PPPPPP..UUUUUU.',
    '.PPPPP....UUUUU.',
    '.PPPP......UUUU.',
    '................',
]))

# 9 Heart
SPRITES.append(S('heart', [
    '................',
    '..RRRR....RRRR..',
    '.RRRRRR..RRRRRR.',
    '.RRPPRRRRRRRRRR.',
    '.RRRRRRRRRRRRRR.',
    '.RRRRRRRRRRRRRR.',
    '..RRRRRRRRRRRR..',
    '...RRRRRRRRRR...',
    '....RRRRRRRR....',
    '.....RRRRRR.....',
    '......RRRR......',
    '.......RR.......',
    '................',
    '................',
]))

# 10 Star
SPRITES.append(S('star', [
    '................',
    '.......YY.......',
    '......YYYY......',
    '.....YYYYYY.....',
    'YYYYYYOOOOYYYYYY',
    '.YYYYYOOOOYYYYY.',
    '..YYYYOOOOYYYY..',
    '...YYYYYYYYYY...',
    '..YYYYYYYYYYYY..',
    '.YYYY......YYYY.',
    'YYY..........YYY',
    'YY............YY',
    '................',
    '................',
]))

# 11 Mushroom
SPRITES.append(S('mushroom', [
    '................',
    '.....RRRRRR.....',
    '....RRRRRRRR....',
    '...RRWWRRRRRR...',
    '..RRRRRRWWRRRR..',
    '.RRRRRRRRRRRRRR.',
    '.RRRRRRRRRRRRRR.',
    '..WWWWWWWWWWWW..',
    '...WWWWWWWWWW...',
    '...WWWWWWWWWW...',
    '...WWWWWWWWWW...',
    '....WWWWWWWW....',
    '.....WWWWWW.....',
    '................',
]))

# 12 Flower
SPRITES.append(S('flower', [
    '................',
    '......PPP.......',
    '....PPPPPPP.....',
    '...PPYYYYYPP....',
    '..PPYYYYYYYPP...',
    '..PPYYYKKYYYPP..',
    '...PPYYYYYPP....',
    '....PPPPPPP.....',
    '......PPP.......',
    '.......G........',
    '.......G........',
    '......GGG.......',
    '.....G...G......',
    '................',
]))

# 13 Cactus
SPRITES.append(S('cactus', [
    '................',
    '......GG........',
    '.....GGGG.......',
    '.....GGGG..GG...',
    '.....GGGG.GGGG..',
    '..GG.GGGG.GGGG..',
    '.GGGGGGGG..GG...',
    '.GGGGGGGG.......',
    '..GG.GGGG.......',
    '.....GGGG.......',
    '.....GGGG.......',
    '.....GGGG.......',
    '....NNNNNN......',
    '...NNNNNNNN.....',
    '................',
]))

# 14 Tree
SPRITES.append(S('tree', [
    '................',
    '......GGGG......',
    '.....GGGGGG.....',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '.....GGGGGG.....',
    '......NNNN......',
    '......NNNN......',
    '......NNNN......',
    '.....NNNNNN.....',
    '................',
]))

# 15 House
SPRITES.append(S('house', [
    '................',
    '.......RR.......',
    '......RRRR......',
    '.....RRRRRR.....',
    '....RRRRRRRR....',
    '...RRRRRRRRRR...',
    '..RRRRRRRRRRRR..',
    '.WWWWWWWWWWWWWW.',
    '.WWWWWWWWWWWWWW.',
    '.WWWBBWWWWWWWWW.',
    '.WWWBBWWWNNWWWW.',
    '.WWWBBWWWNNWWWW.',
    '.WWWWWWWWWWWWWW.',
    '.WWWWWWWWWWWWWW.',
    '................',
]))

# 16 Castle
SPRITES.append(S('castle', [
    '................',
    '.UU.UU....UU.UU.',
    '.UU.UU....UU.UU.',
    '.UUUUUUUUUUUUUU.',
    '.UUUUUUUUUUUUUU.',
    '.UUYYYYUUYYYYUU.',
    '.UUYYYYUUYYYYUU.',
    '.UUUUUUUUUUUUUU.',
    '.UUUUUYYYYUUUUU.',
    '.UUUUUYYYYUUUUU.',
    '.UUUUUYYYYUUUUU.',
    '.UUUUUUUUUUUUUU.',
    '.NNNNNNNNNNNNNN.',
    '................',
]))

# 17 Rocket
SPRITES.append(S('rocket', [
    '................',
    '.......WW.......',
    '......WWWW......',
    '.....WWWWWW.....',
    '.....WWBBWW.....',
    '.....WWWWWW.....',
    '.....RRRRRR.....',
    '.....RRRRRR.....',
    '....WRRRRRRW....',
    '...W.RRRRRR.W...',
    '..W..RRRRRR..W..',
    '.....OOOOOO.....',
    '......OOOO......',
    '.......YY.......',
    '................',
]))

# 18 UFO
SPRITES.append(S('ufo', [
    '................',
    '......CCCC......',
    '.....CCCCCC.....',
    '....CCWWWWCC....',
    '...CCCCCCCCCC...',
    '..UUUUUUUUUUUU..',
    '.UUUYUYUYUYUUU..',
    '..UUUUUUUUUUUU..',
    '...CCCCCCCCCC...',
    '....C......C....',
    '................',
    '................',
    '................',
    '................',
]))

# 19 Car
SPRITES.append(S('car', [
    '................',
    '................',
    '....BBBBBB......',
    '...BBWWWWBB.....',
    '..BBBBBBBBBB....',
    '.RRRRRRRRRRRRR..',
    '.RRRRRRRRRRRRR..',
    '.RRKKRRRRRRKKR..',
    '..KK........KK..',
    '................',
    '................',
    '................',
    '................',
    '................',
]))

# 20 Bike
SPRITES.append(S('bike', [
    '................',
    '........RR......',
    '.......RR.......',
    '......BBBB......',
    '.....BB..BB.....',
    '..BBBB....BBBB..',
    '.BB..BB..BB..BB.',
    '.B....B..B....B.',
    '.BB..BB..BB..BB.',
    '..BBBB....BBBB..',
    '................',
    '................',
    '................',
    '................',
]))

# 21 Boat
SPRITES.append(S('boat', [
    '................',
    '........WW......',
    '.......WWW......',
    '......WWWWW.....',
    '.....WWWWWWW....',
    '....WWWWWWWWW...',
    '........NN......',
    '........NN......',
    '..OOOOOOOOOOOO..',
    '.OOOOOOOOOOOOOO.',
    '..OOOOOOOOOOOO..',
    '...BBBBBBBBBB...',
    '....BBBBBBBB....',
    '................',
]))

# 22 Cupcake
SPRITES.append(S('cupcake', [
    '................',
    '......RR........',
    '.....PPPP.......',
    '....PPPPPP......',
    '...PPWWWWPP.....',
    '..PPPPPPPPPP....',
    '..YYYYYYYYYY....',
    '..YWWYWWYWWY....',
    '..YYYYYYYYYY....',
    '..YYYYYYYYYY....',
    '...YYYYYYYY.....',
    '................',
    '................',
    '................',
]))

# 23 Ice cream
SPRITES.append(S('ice_cream', [
    '................',
    '.....PPPPPP.....',
    '....PPPPPPPP....',
    '...PPWWPPPPPP...',
    '...PPPPPPPPPP...',
    '....GGGGGGGG....',
    '....GGWWGGGG....',
    '....GGGGGGGG....',
    '.....NNNNNN.....',
    '......NNNN......',
    '.......NN.......',
    '........N.......',
    '................',
    '................',
]))

# 24 Coffee cup
SPRITES.append(S('coffee_cup', [
    '................',
    '...WWWWWWW......',
    '...WWWWWWW.WW...',
    '...NNNNNNN.W.W..',
    '...NNNNNNN.W.W..',
    '...NNNNNNN.WW...',
    '...NNNNNNN......',
    '...NNNNNNN......',
    '...NNNNNNN......',
    '....NNNNN.......',
    '.....NNN........',
    '................',
    '................',
    '................',
]))

# 25 Pizza slice
SPRITES.append(S('pizza', [
    '................',
    '........YY......',
    '.......YYYY.....',
    '......YYRRYY....',
    '.....YYYYYYYY...',
    '....YYRRYYRRYY..',
    '...YYYYYYYYYYYY.',
    '..YYRRYYYYYYRRY.',
    '.YYYYYYYYYYYYYY.',
    '.NNNNNNNNNNNNNN.',
    '..NNNNNNNNNNNN..',
    '................',
    '................',
    '................',
]))

# 26 Burger
SPRITES.append(S('burger', [
    '................',
    '....OOOOOOOO....',
    '...OOOOOOOOOO...',
    '..OOOOWWWOOOOO..',
    '..OOOOOOOOOOOO..',
    '..GGGGGGGGGGGG..',
    '..RRRRRRRRRRRR..',
    '..YYYYYYYYYYYY..',
    '..OOOOOOOOOOOO..',
    '...OOOOOOOOOO...',
    '....OOOOOOOO....',
    '................',
    '................',
    '................',
]))

# 27 Apple
SPRITES.append(S('apple', [
    '................',
    '.......NN.......',
    '......GG........',
    '....RRRRRR......',
    '...RRRRRRRR.....',
    '..RRWWRRRRRR....',
    '..RRRRRRRRRR....',
    '..RRRRRRRRRR....',
    '..RRRRRRRRRR....',
    '...RRRRRRRR.....',
    '....RRRRRR......',
    '.....RRRR.......',
    '................',
    '................',
]))

# 28 Banana
SPRITES.append(S('banana', [
    '................',
    '..........NN....',
    '.........YYY....',
    '........YYYY....',
    '.......YYYYY....',
    '......YYYYY.....',
    '.....YYYYY......',
    '....YYYYY.......',
    '...YYYYY........',
    '..YYYYY.........',
    '..YYYY..........',
    '...YY...........',
    '................',
    '................',
]))

# 29 Grapes
SPRITES.append(S('grapes', [
    '................',
    '......GG........',
    '.....GG.........',
    '....UUUUUU......',
    '...UUUUUUUU.....',
    '..UU.UU.UU.U....',
    '..UUUUUUUUUU....',
    '...UU.UU.UU.....',
    '...UUUUUUUU.....',
    '....UU.UU.U.....',
    '....UUUUUU......',
    '.....UUUU.......',
    '................',
    '................',
]))

# 30 Strawberry
SPRITES.append(S('strawberry', [
    '................',
    '.....GGGGGG.....',
    '......GGGG......',
    '.....RRRRRR.....',
    '....RRYYRRYR....',
    '...RRRRRRRRRR...',
    '...RRYRRRYRRR...',
    '..RRRRRRRRRRRR..',
    '..RRYRRRYRRRYR..',
    '...RRRRRRRRRR...',
    '....RRRRRRRR....',
    '.....RRRRRR.....',
    '......RRRR......',
    '................',
]))

# 31 Lemon
SPRITES.append(S('lemon', [
    '................',
    '......GGYY......',
    '.....YYYYYY.....',
    '....YYYYYYYY....',
    '...YYYYYYYYYY...',
    '..YYYYWWYYYYYY..',
    '..YYYYYYYYYYYY..',
    '..YYYYYYYYYYYY..',
    '...YYYYYYYYYY...',
    '....YYYYYYYY....',
    '.....YYYYYY.....',
    '......YYYY......',
    '................',
    '................',
]))

# 32 Watermelon slice
SPRITES.append(S('watermelon', [
    '................',
    '................',
    '.GGGGGGGGGGGGGG.',
    '.GWWWWWWWWWWWWG.',
    '.GWRRWRRWRRWRRG.',
    '.GWRRRRRRRRRWRG.',
    '.GWRRWRRWRRWRRG.',
    '.GWRRRRRRRRRWRG.',
    '..GWRRWRRWRRWG..',
    '...GWRRRRRRWG...',
    '....GWRRWRWG....',
    '.....GWRRWG.....',
    '......GWWG......',
    '.......GG.......',
]))

# 33 Crown
SPRITES.append(S('crown', [
    '................',
    'Y......Y......Y.',
    'YY....YYY....YY.',
    'YYY..YYYYY..YYY.',
    'YYYYYYYYYYYYYYY.',
    'YYYYRYYYYYRYYYY.',
    'YYYYYYYYYYYYYYY.',
    'YYYYYYYYYYYYYYY.',
    '.YYYYYYYYYYYYY..',
    '................',
    '................',
    '................',
    '................',
    '................',
]))

# 34 Gem
SPRITES.append(S('gem', [
    '................',
    '......CC........',
    '.....CCCC.......',
    '....CCCCCCCC....',
    '...CCWWWWCCCC...',
    '..CCCCCCCCCCCC..',
    '..CCCCCCCCCCCC..',
    '...CCCCCCCCCC...',
    '....CCCCCCCC....',
    '.....CCCCCC.....',
    '......CCCC......',
    '.......CC.......',
    '................',
    '................',
]))

# 35 Potion
SPRITES.append(S('potion', [
    '................',
    '......WW........',
    '......WW........',
    '.....WWWW.......',
    '....WWWWWW......',
    '...UUUUUUUU.....',
    '...UWWUUUUU.....',
    '...UUUUUUUU.....',
    '...UUUUUUUU.....',
    '....UUUUUU......',
    '.....UUUU.......',
    '................',
    '................',
    '................',
]))

# 36 Sword
SPRITES.append(S('sword', [
    '................',
    '.......CC.......',
    '......CCCC......',
    '......CCCC......',
    '......CCCC......',
    '......CCCC......',
    '......CCCC......',
    '....YYYYYYYY....',
    '.....YYYYYY.....',
    '.......NN.......',
    '.......NN.......',
    '.......NN.......',
    '......NNNN......',
    '................',
]))

# 37 Key
SPRITES.append(S('key', [
    '................',
    '....YYYY........',
    '...YYWWYY.......',
    '...YYYYYY.......',
    '....YYYY........',
    '.....YY.........',
    '.....YY.........',
    '.....YYYY.......',
    '.....YY.........',
    '.....YYYY.......',
    '.....NN.........',
    '................',
    '................',
    '................',
]))

# 38 Moon + stars
SPRITES.append(S('moon_stars', [
    '................',
    '..Y.........W...',
    '....YYYY........',
    '...YYYYYY...Y...',
    '..YYYY.YYY......',
    '.YYYY...YY......',
    '.YYYY...........',
    '.YYYY...........',
    '..YYYY...W......',
    '...YYYYYY.......',
    '....YYYY....Y...',
    '.........W......',
    '................',
    '................',
]))

# 39 Camera
SPRITES.append(S('camera', [
    '................',
    '................',
    '....NNNN........',
    '...NNNNNNNNNNN..',
    '..NNNNNNNNNNNNN.',
    '.NNNYYYNNNNNNNN.',
    '.NNYYYYYYNNNNNN.',
    '.NNYYKKYYNNNNNN.',
    '.NNYYYYYYNNNNNN.',
    '.NNNYYYYNNNNNNN.',
    '..NNNNNNNNNNNN..',
    '................',
    '................',
    '................',
]))

# 40 Guitar
SPRITES.append(S('guitar', [
    '................',
    '..........NN....',
    '.........NNN....',
    '........NN......',
    '.......NN.......',
    '......NN........',
    '.....OOOO.......',
    '....OOOOOO......',
    '...OOOWWOOO.....',
    '...OOOOOOOO.....',
    '....OOOOOO......',
    '.....OOOO.......',
    '................',
    '................',
]))

# 41 Gamepad
SPRITES.append(S('gamepad', [
    '................',
    '................',
    '..BBBBBBBBBBBB..',
    '.BBWWBBBBWWBBBB.',
    '.BBKKBBBBKKBRRB.',
    '.BBBBBBBBBBBBBB.',
    '.BB..BBBB..BBBB.',
    '..BB........BB..',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
]))

# 42 Robot head
SPRITES.append(S('robot', [
    '................',
    '.......C........',
    '......CCC.......',
    '....WWWWWWWW....',
    '...WWWWWWWWWW...',
    '..WWKKWWWWKKWW..',
    '..WWWWWWWWWWWW..',
    '..WWWWYYYYWWWW..',
    '..WWWWWWWWWWWW..',
    '...WWWWWWWWWW...',
    '....WWWWWWWW....',
    '.....W....W.....',
    '................',
    '................',
]))

# 43 Ghost
SPRITES.append(S('ghost', [
    '................',
    '.....WWWWWW.....',
    '....WWWWWWWW....',
    '...WWWWWWWWWW...',
    '..WWKKWWWWKKWW..',
    '..WWWWWWWWWWWW..',
    '..WWWWWWWWWWWW..',
    '..WWWWWWWWWWWW..',
    '..WWWWWWWWWWWW..',
    '..WW.WWWW.WWWW..',
    '..W...WW...WWW..',
    '................',
    '................',
    '................',
]))

# 44 Cute skull
SPRITES.append(S('skull', [
    '................',
    '.....WWWWWW.....',
    '....WWWWWWWW....',
    '...WWWWWWWWWW...',
    '..WWKKWWWWKKWW..',
    '..WWWWWWWWWWWW..',
    '..WWWWWNNWWWWW..',
    '...WWWWWWWWWW...',
    '....W.W..W.W....',
    '....W.W..W.W....',
    '................',
    '................',
    '................',
    '................',
]))

# 45 Cloud + sun
SPRITES.append(S('cloud_sun', [
    '................',
    '...........YY...',
    '....WW....YYYY..',
    '...WWWW..YYYYYY.',
    '..WWWWWW..YYYY..',
    '.WWWWWWWWW.YY...',
    '.WWWWWWWWWW.....',
    '..WWWWWWWW......',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
]))

# 46 Mountain
SPRITES.append(S('mountain', [
    '................',
    '.......WW.......',
    '......WWWW......',
    '.....WWWWWW.....',
    '....NNWWWWWN....',
    '...NNNNNNNNNN...',
    '..NNNNGGNNNNNN..',
    '.NNNNNGGNNNNNNN.',
    '.NNNNNNNNNNNNNN.',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
]))

# 47 Lighthouse
SPRITES.append(S('lighthouse', [
    '................',
    '.......YY.......',
    '......YYYY......',
    '.......RR.......',
    '......WWWW......',
    '......WRRW......',
    '......WWWW......',
    '......WRRW......',
    '......WWWW......',
    '......WRRW......',
    '.....WWWWWW.....',
    '....NNNNNNNN....',
    '...BBBBBBBBBB...',
    '................',
]))

# Fix any that fail size/fill — pad bike, coffee, key, skull, gamepad, cloud_sun
# Re-check and patch undersized ones

def fix_pad(sp, min_fill=40):
    # already asserted; this is just for redefinition
    pass

# Validate all
for sp in SPRITES:
    print(f"{sp['name']:16} {sp['w']:2}x{sp['h']:2} fill={sp['_filled']:3} colors={sp['_colors']}")

print('TOTAL', len(SPRITES))

# Emit clean JS (strip helper keys)
out = []
for sp in SPRITES:
    out.append({
        'name': sp['name'],
        'w': sp['w'],
        'h': sp['h'],
        'grid': sp['grid'],
    })

js = 'const SPRITE_LEVELS = ' + json.dumps(out, separators=(',', ':')) + ';'
open('/workspace/loopdrop/tools/sprite_levels.fragment.js', 'w').write(js)
print('Wrote fragment, bytes', len(js))
