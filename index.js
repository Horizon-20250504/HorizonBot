const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token, originalVoiceChannelId } = require('./config.json');
const { handleCommand } = require('./features/customCommands');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const dynamicVoiceChannels = new Set();

const thankYouChannelId = '1354479927109484626'; // 请根据您的实际情况填写

client.once(Events.ClientReady, (c) => {
  console.log(`已准备好！已登录为 ${c.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith('!')) {
    try {
      const replyMessage = await handleCommand(message);
      if (replyMessage) {
        message.reply(replyMessage);
      }
    } catch (err) {
      console.error(err);
      message.reply('发生错误，指令处理失败。');
    }
  }
});


client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  if (newState.channelId === originalVoiceChannelId && oldState.channelId !== originalVoiceChannelId) {
    const member = newState.member;
    const guild = newState.guild;
    const category = newState.channel.parent;

    const categoryPermissions = category.permissionOverwrites.cache;

    const newChannelPermissions = categoryPermissions.map((permission) => ({
      id: permission.id,
      allow: permission.allow,
      deny: permission.deny,
    }));

    const newChannel = await guild.channels.create({
      name: `${member.user.username} 的Valorant房间`,
      type: 2, // 2 表示语音频道
      parent: category,
      permissionOverwrites: newChannelPermissions,
    });

    await member.voice.setChannel(newChannel);

    dynamicVoiceChannels.add(newChannel.id);
  }

  if (dynamicVoiceChannels.has(oldState.channelId) && newState.channelId !== oldState.channelId) {
    const channel = oldState.channel;

    if (channel.members.size === 0) {
      try {
        await channel.delete();
        dynamicVoiceChannels.delete(channel.id);

        try {
          const thankYouChannel = await oldState.guild.channels.fetch(thankYouChannelId);
          if (thankYouChannel) {
            console.log('感谢频道已找到:', thankYouChannel.name);
            await thankYouChannel.send(`感谢各位使用${channel.name}，${channel.name}已经关闭啦~感谢使用~希望下次还能见到你们使用我们的临时频道~感谢~`);
          } else {
            console.log('未找到指定的感谢频道');
          }
        } catch (error) {
          console.error('获取频道时发生错误:', error);
        }

        console.log(`已删除空的频道: ${channel.name}`);
      } catch (error) {
        console.error('删除频道时发生错误:', error);
      }
    }
  }
});

client.login(token);