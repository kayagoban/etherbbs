#!/usr/bin/ruby

require 'pry'


# Remove import lines and single line comments and concatenate 
code = ARGV.inject("") do |accumulator, filename|
  accumulator += %x(grep -vwE "(import | //)" #{filename})
  accumulator
end

# Remove newlines and 
code.gsub!("\n",' ').gsub!('"',"'")

deploy_script = File.read('deploy.js')

deploy_script.gsub!("__SOURCE__", code)

File.write('/tmp/deploy.js', deploy_script)

