<template lang="pug">
#irc
    section.section
        .container
            .content
                h1 IRC
                h3 Want to chat with us on IRC? Need help with it? Not sure what it is?
                h5.has-text-secondary What is IRC?
                p
                    | Internet Relay Chat is (primarily) a text chat protocol. You can use it to chat to people who are playing on our game servers without being in-game yourself. A more detailed description is available
                    |
                    a(href="https://en.wikipedia.org/wiki/Internet_Relay_Chat") here
                    | .

                h5.has-text-secondary What do I need to connect?
                p
                    | To join us, you will need an IRC client. There are many clients available across a wide range of platforms such as
                    |
                    a(href="https://hexchat.github.io/") HexChat
                    | ,
                    |
                    a(href="https://www.pidgin.im/") Pidgin
                    |
                    | and
                    |
                    a(href="https://www.mirc.co.uk/") mIRC
                    | . There are also web-based clients available such as
                    |
                    a(href="https://kiwiirc.com/nextclient/#irc://irc.threekelv.in/#metastruct") Kiwi IRC
                    |
                    | and
                    |
                    a(href="https://mibbit.com/?channel=%23metastruct&amp;server=threekelv.in") Mibbit
                    | .
                p
                    | You can view a more comprehensive list of clients
                    |
                    a(href="https://en.wikipedia.org/wiki/Comparison_of_Internet_Relay_Chat_clients") here
                    | .

                h5.has-text-secondary Where do I join?
                p
                    | You can join
                    |
                    a(href="irc://threekelv.in/metastruct") #metastruct on threekelv.in
                    |
                    | (
                    a(href="https://kiwiirc.com/nextclient/#irc://irc.threekelv.in/#metastruct") Kiwi IRC
                    | ,
                    |
                    a(href="https://mibbit.com/?channel=%23metastruct&amp;server=threekelv.in") Mibbit
                    | ).

                h5.has-text-secondary Registration, or: Why do I see ticks/crosses next to people's names in-game?
                p
                    | Anyone can use a nickname in IRC, so this means that someone may not be who they say they are. We have an automated service, NickServ, which allows people to
                    |
                    i register
                    |
                    | their nickname so only they can use it. People who have not registered and are using a non-registered name will have no symbol next to their name. People who are using a registered nickname but have not identified with NickServ will have a red cross
                    |
                    b(style="color: red;") ✕
                    |
                    | next to their name.
                p
                    b However
                    | , just because someone has registered their nick and logged in it
                    |
                    b does not
                    |
                    | mean they are who they say they are, as an impostor may have registered the nick. For this reason, we have a third status, the green tick
                    |
                    b(style="color: green;") ✓
                    |
                    | , which means the user has identified with NickServ
                    |
                    b and
                    |
                    | an admin has verified this person's identity.
                p
                    | A grey question mark
                    |
                    b(style="color: grey;") ?
                    |
                    | indicates the status of the nickname's registration is unknown (for example if NickServ is offline).

                h5.has-text-secondary How do I register my nickname?
                p You can send a private message to NickServ ("help") for a list of commands, including how to register.

                h5.has-text-secondary I need help!
                p
                    | If you need help with IRC, join the
                    |
                    a(href="irc://threekelv.in/help") #help
                    |
                    | channel!

</template>

<script>

export default {
    head() {
        return {
            title: "IRC - Meta Construct"
        }
    },
}

</script>

