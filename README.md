# Flashline / skanerocr

Offlineowy prototyp łącza optycznego telefon–telefon. Telefon A nadaje dane przez diodę LED, telefon B odbiera je kamerą, a odebrana treść jest wyświetlana jako zwykły czat.

## Struktura

- `src/index.html` — jedyne źródło aplikacji; zawiera cały HTML, CSS i JavaScript.
- `build.sh` — bezzależnościowy build kopiujący źródło do `public/index.html` oraz aktualizujący kopię `index.html` w katalogu głównym.
- `public/index.html` — wynik budowania, gotowy do publikacji jako statyczna strona.
- `index.html` — wygodna kopia wynikowa do otwarcia lokalnie.

Nie ma npm, CDN-u, bundlera ani zewnętrznych bibliotek. Powtórzenie budowania:

```sh
./build.sh
```

Uruchomienie lokalne:

```sh
python3 -m http.server 3000 --directory public
```

Kamera w przeglądarce wymaga bezpiecznego kontekstu (`https://`) albo `localhost`. Zasięg 2 km jest eksperymentalny i wymaga testu terenowego; aplikacja nie może zagwarantować absolutnego braku błędów bez odpowiedniej optyki i warunków łącza.
