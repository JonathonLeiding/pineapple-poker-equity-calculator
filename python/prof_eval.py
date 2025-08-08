import cProfile
import Cardset
import monte_carlo
import player
import evaluator as ev

if __name__ == "__main__":
    deck = Cardset.Cardset()
    hero = player.Player()
    hero.set_cards(["Ts", "As"], deck)
    villain = player.Player()
    villain.set_cards(["9c", "9s"], deck)
    # deck.set_community_cards(["4s", "8s", "2h", "9h", "5s"])
    # monte_carlo.estimate_equity(hero, villain, deck, 100000)
    cProfile.run('monte_carlo.estimate_equity(hero, villain, deck, 100000)')
