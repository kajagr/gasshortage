# Gas Shortage!
Challenging game where survival depends on your ability to navigate a world plagued by a relentless scarcity of fuel. When the car runs out of gas, it's game over!

## Navodila za zagon

### HTTP strežnik
V terminalu zaženemo ukaz `python -m http.server` in zagnan strežnik odpremo v brskalniku.

### VS Code
Z nameščenim "Live Server" extension pritisnemo gumb "Go Live" in igra se nam odpre v brskalniku.

## Navodila za upravljanje

### Premikanje vozila
Vozilo je samovozeče, uporabnik upravlja le smer gibanja.

- zavijanje levo:
    - puščica levo ali tipka A

- zavijanje desno:
    - puščica desno ali tipka D

- hitrost igre:
    - v primeru, da vam je igra prepočasna ali prehitra, lahko spreminjate "Game Speed"
    - spreminjanje "Game Speed" nastavitve ne vpliva na težavnost igre, saj so vsi parametri vezani na "Game Speed"

## Cilj igre
Doseči najvišji "Score".
V igri pobiramo kanistre goriva, ki nam polnijo tank. Izogibamo se trkom s stavbami, saj nam to zmanjšuje življenje vozila. Življenje lahko napolnimo s pobiranjem srčkov. Igre je konec, ko nam zmanjka goriva ali življenja. Tempo igre se s "Scorom" stopnjuje - hitrost avta in poraba goriva se povečujeta.