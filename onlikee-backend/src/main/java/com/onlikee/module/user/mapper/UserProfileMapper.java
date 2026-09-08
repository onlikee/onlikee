package com.onlikee.module.user.mapper;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import com.onlikee.module.user.model.entity.UserEntity;
import com.onlikee.module.user.model.entity.UserProfileMarkdownEntity;

@Mapper
public interface UserProfileMapper {

    @Select("""
            select *
            from "user"
            where nickname = #{nickname}
            """)
    UserEntity getUserByNickname(@Param("nickname") String nickname);

    @Select("""
            select *
            from user_profile_markdown
            where uuid = #{uuid}
            """)
    UserProfileMarkdownEntity getMarkdownByUuid(@Param("uuid") String uuid);

    @Insert("""
            insert into user_profile_markdown
            (uuid, content)
            values
            (#{uuid}, #{content})
            on conflict (uuid) do update set
                content = excluded.content,
                updated_at = current_timestamp
            """)
    int upsertMarkdown(@Param("uuid") String uuid, @Param("content") String content);

    @Update("""
            update "user"
            set bio = #{bio},
                pronoun = #{pronoun},
                location = #{location},
                social_account_0 = #{socialAccount0},
                social_account_1 = #{socialAccount1},
                social_account_2 = #{socialAccount2},
                updated_at = current_timestamp
            where uuid = #{uuid}
            """)
    int updateCurrentUserProfile(@Param("uuid") String uuid,
                                 @Param("bio") String bio,
                                 @Param("pronoun") String pronoun,
                                 @Param("location") String location,
                                 @Param("socialAccount0") String socialAccount0,
                                 @Param("socialAccount1") String socialAccount1,
                                 @Param("socialAccount2") String socialAccount2);
}
