package com.onlikee.module.user.mapper;

import java.time.LocalDateTime;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import com.onlikee.module.user.model.entity.UserEntity;

@Mapper
public interface UserMapper {

    @Select("""
            select *
            from "user"
            where uuid = #{uuid}
            """)
    UserEntity getUserByUuid(@Param("uuid") String uuid);

    @Select("""
            select u.*
            from "user" u
            join user_github ug on u.uuid = ug.uuid
            where ug.github_id = #{githubId}
            """)
    UserEntity getUserByGithubId(@Param("githubId") Long githubId);

    @Select("""
            select u.*
            from "user" u
            join user_gitee ug on u.uuid = ug.uuid
            where ug.gitee_id = #{giteeId}
            """)
    UserEntity getUserByGiteeId(@Param("giteeId") Long giteeId);

    @Select("""
            select count(1)
            from "user"
            where nickname = #{nickname}
            """)
    int countByNickname(@Param("nickname") String nickname);

    @Select("""
            select count(1)
            from "user"
            where email = #{email}
            """)
    int countByEmail(@Param("email") String email);

    @Insert("""
            insert into "user"
            (uuid, nickname, email, avatar_url, last_login_source)
            values
            (#{uuid}, #{nickName}, #{email}, #{avatarUrl}, #{lastLoginSource})
            """)
    int insertUser(UserEntity user);

    @Update("""
            update "user"
            set last_login_at = #{lastLoginAt},
                last_login_source = #{lastLoginSource}
            where uuid = #{uuid}
            """)
    int updateUserLastLoginByUuid(@Param("uuid") String uuid,
                                  @Param("lastLoginAt") LocalDateTime lastLoginAt,
                                  @Param("lastLoginSource") String lastLoginSource);

    @Insert("""
            insert into user_login_record (uuid, login_source)
            values (#{uuid}, #{loginSource})
            """)
    int insertUserLoginRecord(@Param("uuid") String uuid,
                              @Param("loginSource") String loginSource);
}
