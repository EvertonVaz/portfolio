#!/bin/bash

# If there is a Makefile in the current directory (or a source dir), we could compile the C minishell.
# But as per requirements, we execute what is in /src.
# Assuming the Elixir release is in /src and has a binary in bin/
source ~/.bashrc

mise use --global erlang@latest elixir@latest

rel/messaging/bin/messaging start
